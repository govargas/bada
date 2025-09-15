import { Router } from "express";
import { havGet, getLatestSampleDate } from "../lib/hav.js";

export const beachesRouter = Router();

/**
 * GET /api/beaches
 * Proxies HaV "feature" endpoint (GeoJSON-like).
 */
beachesRouter.get("/beaches", async (_req, res, next) => {
  try {
    const data = await havGet("/feature/?format=json", 5 * 60 * 1000); // cache 5 min
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/beaches/:id
 * HaV v1 detail + latest sample date from HaV v2 results.
 * Example ID: SE0110180000001869
 */
beachesRouter.get("/beaches/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // v1 detail
    const data = await havGet(
      `/detail/${encodeURIComponent(id)}`,
      5 * 60 * 1000
    );

    // v2 latest sample date
    let latestSampleDate: string | null = null;
    try {
      latestSampleDate = await getLatestSampleDate(id);
    } catch (e) {
      console.error("[HaV v2 latest sample error]", e);
      // keep going; we still return the v1 detail
    }

    res.json({ ...data, latestSampleDate });
  } catch (err) {
    next(err);
  }
});
