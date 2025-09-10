import { Router } from "express";
export const healthRouter = Router();
healthRouter.get("/health", async (_req, res) => {
    res.json({
        ok: true,
        env: process.env.NODE_ENV ?? "development",
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=health.js.map