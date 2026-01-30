import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";
export declare const requireRole: (role: "admin" | "user") => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=requireRole.d.ts.map