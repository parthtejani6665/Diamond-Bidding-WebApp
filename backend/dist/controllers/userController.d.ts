import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const listUsers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleUserStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=userController.d.ts.map