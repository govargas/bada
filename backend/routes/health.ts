import { Router } from "express";

export const healthRouter = Router();

// Express 5 supports async handlers out of the box
healthRouter.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});
