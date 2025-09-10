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

// IMPORTANT: the function is already mounted at /api
// so we mount our router at the root ("") here
app.use(healthRouter);

// Temporary direct route for sanity (now at /api/health-direct)
app.get("/health-direct", (_req, res) => {
  console.log("Hit /health-direct");
  res.json({ ok: true, via: "direct" });
});

// 404 + error handlers
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));
app.use((err: unknown, _req: any, res: any, _next: any) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "InternalServerError" });
});

export default serverless(app);
