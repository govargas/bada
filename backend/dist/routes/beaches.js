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
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /api/beaches/:id
 * Proxies HaV v1 detail and augments with latestSampleDate.
 * Prefers v1.sampleDate (epoch ms); falls back to v2 results when needed.
 */
beachesRouter.get("/beaches/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        // v1 detail
        const detail = await havGet(`/detail/${encodeURIComponent(id)}`, 5 * 60 * 1000);
        // prefer v1 sampleDate (epoch ms)
        let latestSampleDate = null;
        const v1Ms = detail?.sampleDate;
        if (typeof v1Ms === "number" && isFinite(v1Ms)) {
            latestSampleDate = new Date(v1Ms).toISOString();
        }
        else {
            // fallback to v2
            try {
                latestSampleDate = await getLatestSampleDate(id);
            }
            catch (e) {
                // don't fail the whole request if v2 errors; just leave null
                console.warn("[/beaches/:id] v2 fallback failed:", e?.message);
            }
        }
        res.json({ ...detail, latestSampleDate });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=beaches.js.map