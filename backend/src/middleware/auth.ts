import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SESSION_COOKIE } from "../lib/sessionCookie.js";

export interface AuthedRequest extends Request {
  user: { sub: string; email: string }; // ← non-optional
}

/**
 * Resolve the JWT from the httpOnly session cookie first, then fall back to the
 * `Authorization: Bearer` header. The header fallback keeps older localStorage
 * clients (and the existing test suite) working during the cookie migration.
 */
function readToken(req: Request): string | null {
  const cookieToken = (req as Request & { cookies?: Record<string, string> })
    .cookies?.[SESSION_COOKIE];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization; // "Bearer <token>"
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ error: "NoAuthToken" });

    const payload = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as {
      sub: string;
      email: string;
    };
    (req as AuthedRequest).user = payload; // set strongly-typed user
    next();
  } catch {
    return res.status(401).json({ error: "InvalidToken" });
  }
}
