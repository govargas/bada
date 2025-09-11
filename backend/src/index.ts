console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";

import { healthRouter } from "./routes/health.js";

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

// NOTE: Vercel routes /api/* TO this handler.
// So keep the mount at /api so /api/health resolves correctly.
app.use("/api", healthRouter);

// temporary direct test
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

// 404 + error handlers
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));
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

// ✅ Export the Express app itself. Vercel's Node runtime can call it directly.
export default app;
