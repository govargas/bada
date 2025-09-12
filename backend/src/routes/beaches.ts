import { Router } from "express";
import { havGet } from "../lib/hav.js";

export const beachesRouter = Router();

/**
 * GET /api/beaches
 * Proxies HaV "feature" endpoint and returns (likely) GeoJSON.
 * I keep it as a thin proxy for now; later I can normalize + filter.
 */
beachesRouter.get("/beaches", async (_req, res, next) => {
  try {
    // Easiest JSON form; if upstream returns XML, will switch to explicit WFS params.
    const data = await havGet("/feature/?format=json", 5 * 60 * 1000); // cache 5 min
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/beaches/:id
 * Proxies HaV detail endpoint for a single bathing site by ID.
 * Example ID: SE0441273000000001
 */
beachesRouter.get("/beaches/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await havGet(
      `/detail/${encodeURIComponent(id)}`,
      5 * 60 * 1000
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});
