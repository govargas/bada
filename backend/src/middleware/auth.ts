import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  user: { sub: string; email: string }; // ← non-optional
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header) return res.status(401).json({ error: "NoAuthHeader" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token)
      return res.status(401).json({ error: "InvalidAuthHeader" });

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      email: string;
    };
    (req as AuthedRequest).user = payload; // set strongly-typed user
    next();
  } catch {
    return res.status(401).json({ error: "InvalidToken" });
  }
}
