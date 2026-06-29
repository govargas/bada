import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Favorite } from "../models/Favorite.js";
import { connectDB } from "../lib/db.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import {
  setSessionCookie,
  clearSessionCookie,
} from "../lib/sessionCookie.js";

export const authRouter = Router();

authRouter.get("/ping", (_req, res) => res.json({ ok: true, from: "auth" }));

const zCreds = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/auth/register
authRouter.post("/register", authRateLimiter, async (req, res) => {
  try {
    await connectDB();

    const parsed = zCreds.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "InvalidBody", details: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "EmailInUse" });

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("REGISTER_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

// POST /api/auth/login
authRouter.post("/login", authRateLimiter, async (req, res) => {
  try {
    await connectDB();

    const parsed = zCreds.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "InvalidBody", details: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "InvalidCredentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "InvalidCredentials" });

    const token = jwt.sign(
      { sub: String(user._id), email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d", algorithm: "HS256" }
    );
    // Set the httpOnly session cookie (the new auth path) and also return the
    // token in the body so existing header/localStorage clients keep working
    // until the frontend migration lands.
    setSessionCookie(res, token);
    return res.json({ token });
  } catch (err) {
    console.error("LOGIN_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

// POST /api/auth/logout
// Clear the session cookie. Intentionally does not require a valid token so a
// user with an expired/garbled cookie can still log out cleanly.
authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

// DELETE /api/auth/me
// Permanently delete the authenticated user and all of their data (GDPR:
// right to erasure). Favorites are removed first so no orphaned rows remain.
authRouter.delete("/me", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const userId = (req as AuthedRequest).user.sub;

    await Favorite.deleteMany({ userId });
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ error: "NotFound" });

    clearSessionCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE_ACCOUNT_ERR", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});
