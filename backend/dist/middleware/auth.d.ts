import { NextFunction, Request, Response } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: "admin" | "user";
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map