import { Router } from "express";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
export const dbCheckRouter = Router();
dbCheckRouter.get("/db-check", async (_req, res) => {
    try {
        // Ensure we attempt a connection before reporting
        await connectDB();
        const state = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        res.json({
            ok: state === 1,
            state,
            message: state === 1
                ? "MongoDB is connected"
                : state === 2
                    ? "MongoDB is connecting..."
                    : state === 3
                        ? "MongoDB is disconnecting..."
                        : "MongoDB is disconnected",
        });
    }
    catch (err) {
        console.error("DB check error:", err);
        res.status(500).json({ ok: false, error: "DB check failed" });
    }
});
//# sourceMappingURL=dbCheck.js.map