// backend/src/routes/beaches.ts
import { Router } from "express";
import { havGet, getLatestSampleDate } from "../lib/hav.js";

export const beachesRouter = Router();

/**
 * GET /api/beaches
 * Proxies HaV "feature" endpoint and returns (likely) GeoJSON.
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
 * Returns HaV v1 detail + (best-effort) latestSampleDate from v2.
 */
beachesRouter.get("/beaches/:id", async (req, res) => {
  const { id } = req.params;

  // 1) fetch v1 detail — if this fails, respond with a 502 and a helpful message
  try {
    const detail = await havGet(
      `/detail/${encodeURIComponent(id)}`,
      5 * 60 * 1000
    );

    // 2) try to enrich with v2 latest sample date — if that fails, do NOT fail the endpoint
    let latestSampleDate: string | null = null;
    try {
      latestSampleDate = await getLatestSampleDate(id);
    } catch (e) {
      console.warn(
        `[beaches/:id] v2 results fetch failed for ${id}:`,
        (e as Error)?.message
      );
      latestSampleDate = null;
    }

    return res.json({ ...detail, latestSampleDate });
  } catch (e) {
    // v1 detail failed → surface as a 502 (bad gateway) with a friendly message in dev
    const msg = (e as Error)?.message || "Upstream error";
    if (process.env.NODE_ENV !== "production") {
      return res.status(502).json({ error: "UpstreamError", message: msg });
    }
    return res.status(502).json({ error: "UpstreamError" });
  }
});
