console.log("Server booted at", new Date().toISOString());

import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { dbCheckRouter } from "./routes/dbCheck.js";
import { connectDB } from "./lib/db.js";

connectDB()
  .then(() => console.log("Mongo connected"))
  .catch((e) => console.error("Mongo error", e));

// 1) Create app first
const app = express();

// 2) Global middleware (before routers)
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

// 3) Routers (mounted under /api)
app.use("/api", healthRouter);
app.use("/api", dbCheckRouter);

// 4) Temporary direct test
app.get("/api/health-direct", (_req, res) => {
  console.log("Hit /api/health-direct");
  res.json({ ok: true, via: "direct" });
});

// 5) 404 + error handlers
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

// 6) Export the Express app for Vercel
export default app;
