import { Router } from "express";
import { z } from "zod";
import { Favorite } from "../models/Favorite.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";
import type { AnyBulkWriteOperation } from "mongoose";

export const favoritesRouter = Router();

const zCreate = z.object({
  beachId: z.string().min(1),
  note: z.string().max(500).optional(),
});

// Ensure DB connection for every favorites op
favoritesRouter.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/favorites
 * List current user's favorites (stable order)
 */
favoritesRouter.get("/favorites", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.sub;
  const items = await Favorite.find({ userId })
    .sort({ order: 1, updatedAt: 1, _id: 1 }) // stable sort
    .lean();
  res.json(items);
});

/**
 * POST /api/favorites
 */
favoritesRouter.post("/favorites", requireAuth, async (req, res) => {
  const parsed = zCreate.safeParse(req.body);
  if (!parsed.success) {
    // keep the existing error style
    // @ts-ignore - z.treeifyError is available in the codebase
    return res
      .status(400)
      .json({ error: "InvalidBody", details: z.treeifyError(parsed.error) });
  }

  const { beachId, note } = parsed.data;
  const userId = (req as AuthedRequest).user.sub;

  try {
    const created = await Favorite.create({
      userId,
      beachId,
      note: note ?? "",
    });
    return res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "AlreadyFavorited" });
    }
    throw err;
  }
});

/**
 * DELETE /api/favorites/:id
 */
favoritesRouter.delete("/favorites/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).user.sub;

  const id = req.params.id as string | undefined;
  if (!id) return res.status(400).json({ error: "MissingId" });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "InvalidId" });
  }

  const deleted = await Favorite.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ error: "NotFound" });
  res.json({ ok: true });
});

/**
 * DELETE /api/favorites/by-beach/:beachId
 */
favoritesRouter.delete(
  "/favorites/by-beach/:beachId",
  requireAuth,
  async (req, res) => {
    const userId = (req as AuthedRequest).user.sub;
    const { beachId } = req.params;

    const deleted = await Favorite.findOneAndDelete({ beachId, userId });
    if (!deleted) return res.status(404).json({ error: "NotFound" });
    res.json({ ok: true });
  }
);

/**
 * PATCH /api/favorites/reorder
 * Persist custom order. Accepts: { order: string[] } where each string is a beachId.
 * Non-owned or unknown ids are ignored. Any favorites not included are appended after.
 */
favoritesRouter.patch("/favorites/reorder", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.sub;

    const schema = z.object({
      order: z.array(z.string()).min(0),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "InvalidBody", details: parsed.error.flatten() });
    }

    // Deduplicate ids while preserving first occurrence order
    const seen = new Set<string>();
    const order = parsed.data.order.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Fetch user's current favorites
    const favs = await Favorite.find({ userId }, { beachId: 1 }).lean();
    const currentIds = new Set(favs.map((f) => f.beachId));

    // Keep only valid (owned) ids, preserve payload order
    const sanitized = order.filter((id) => currentIds.has(id));

    // Bulk update for provided ids
    const ops: AnyBulkWriteOperation[] = sanitized.map((beachId, idx) => ({
      updateOne: {
        filter: { userId, beachId },
        update: { $set: { order: idx } },
      },
    }));

    // Append any missing favorites not included in payload
    const missing = favs
      .map((f) => f.beachId)
      .filter((id) => !sanitized.includes(id));

    ops.push(
      ...missing.map((beachId, addIdx) => ({
        updateOne: {
          filter: { userId, beachId },
          update: { $set: { order: sanitized.length + addIdx } },
        },
      }))
    );

    if (ops.length > 0) {
      await Favorite.bulkWrite(ops, { ordered: false });
    }

    return res.status(204).end();
  } catch (err) {
    console.error("REORDER_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});
