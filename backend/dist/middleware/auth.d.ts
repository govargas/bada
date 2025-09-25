import { Request, Response, NextFunction } from "express";
export interface AuthedRequest extends Request {
    user: {
        sub: string;
        email: string;
    };
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map