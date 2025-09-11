import { Router, Request, Response } from "express";
import mongoose from "mongoose";

export const dbCheckRouter = Router();

dbCheckRouter.get("/db-check", async (_req: Request, res: Response) => {
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    res.json({
      ok: state === 1,
      state,
      message:
        state === 1
          ? "MongoDB is connected"
          : state === 2
          ? "MongoDB is connecting..."
          : state === 3
          ? "MongoDB is disconnecting..."
          : "MongoDB is disconnected",
    });
  } catch (err) {
    console.error("DB check error:", err);
    res.status(500).json({ ok: false, error: "DB check failed" });
  }
});
