// backend/src/routes/beaches.ts
import { Router } from "express";
import { havGet, getLatestSampleDate } from "../lib/hav.js";

export const beachesRouter = Router();

/**
 * GET /api/beaches
 * Proxies HaV "feature" endpoint and returns (likely) GeoJSON.
 * Kept as a thin proxy; normalization can be added later if needed.
 */
beachesRouter.get("/beaches", async (_req, res, next) => {
  try {
    // Easiest JSON form; if upstream returns XML, switch to explicit WFS params.
    const data = await havGet("/feature/?format=json", 5 * 60 * 1000); // cache 5 min
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/beaches/:id
 * Proxies HaV detail endpoint for a single bathing site by ID
 * and augments with latest sample date from the v2 API.
 * Example ID: SE0441273000000001
 */
beachesRouter.get("/beaches/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch v1 detail and v2 latest sample date in parallel
    const [detail, latestSampleDate] = await Promise.all([
      havGet(`/detail/${encodeURIComponent(id)}`, 5 * 60 * 1000),
      getLatestSampleDate(id).catch(() => null), // don't fail the whole request if v2 hiccups
    ]);

    res.json({
      ...detail,
      latestSampleDate, // ISO string or null
    });
  } catch (err) {
    next(err);
  }
});
