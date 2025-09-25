import jwt from "jsonwebtoken";
export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization; // "Bearer <token>"
        if (!header)
            return res.status(401).json({ error: "NoAuthHeader" });
        const [type, token] = header.split(" ");
        if (type !== "Bearer" || !token)
            return res.status(401).json({ error: "InvalidAuthHeader" });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // set strongly-typed user
        next();
    }
    catch {
        return res.status(401).json({ error: "InvalidToken" });
    }
}
//# sourceMappingURL=auth.js.map