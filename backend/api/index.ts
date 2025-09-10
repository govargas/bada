// backend/api/index.ts
console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";
import serverless from "serverless-http";

import { healthRouter } from "../src/routes/health.js";

const app = express();

const allowed = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true,
    credentials: true,
  })
);

app.use(express.json());

// Mount routes under /api (the function path is /api, so this becomes /api/health)
app.use("/api", healthRouter);

// Temporary direct route for sanity:
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "NotFound" });
});

// Error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err);
    res.status(500).json({ error: "InternalServerError" });
  }
);

export default serverless(app);
