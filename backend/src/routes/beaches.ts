import { Router } from "express";
import { havGet } from "../lib/hav.js";

export const beachesRouter = Router();

// GET /api/beaches → list all beaches (cached)
beachesRouter.get("/beaches", async (_req, res, next) => {
  try {
    const data = await havGet("/BathingSites");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/beaches/:id → single beach by id
beachesRouter.get("/beaches/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await havGet(`/BathingSites/${id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});
