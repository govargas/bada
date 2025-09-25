import { Router } from "express";
import { z } from "zod";
import { Favorite } from "../models/Favorite.js";
import { requireAuth } from "../middleware/auth.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";
export const favoritesRouter = Router();
const zCreate = z.object({
    beachId: z.string().min(1),
    note: z.string().max(500).optional(),
});
favoritesRouter.use(async (_req, _res, next) => {
    // ensure DB connection for every favorites op
    try {
        await connectDB();
        next();
    }
    catch (e) {
        next(e);
    }
});
// GET /api/favorites  -> list current user's favorites
favoritesRouter.get("/favorites", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const items = await Favorite.find({ userId })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    res.json(items);
});
// POST /api/favorites
favoritesRouter.post("/favorites", requireAuth, async (req, res) => {
    const parsed = zCreate.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json({ error: "InvalidBody", details: z.treeifyError(parsed.error) });
    }
    const { beachId, note } = parsed.data;
    const userId = req.user.sub;
    try {
        const created = await Favorite.create({
            userId,
            beachId,
            note: note ?? "",
        });
        return res.status(201).json(created);
    }
    catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ error: "AlreadyFavorited" });
        }
        throw err;
    }
});
// DELETE /api/favorites/:id
favoritesRouter.delete("/favorites/:id", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const id = req.params.id;
    if (!id)
        return res.status(400).json({ error: "MissingId" });
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "InvalidId" });
    }
    const deleted = await Favorite.findOneAndDelete({ _id: id, userId });
    if (!deleted)
        return res.status(404).json({ error: "NotFound" });
    res.json({ ok: true });
});
// DELETE /api/favorites/by-beach/:beachId
favoritesRouter.delete("/favorites/by-beach/:beachId", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const { beachId } = req.params;
    const deleted = await Favorite.findOneAndDelete({ beachId, userId });
    if (!deleted)
        return res.status(404).json({ error: "NotFound" });
    res.json({ ok: true });
});
//# sourceMappingURL=favorites.js.map