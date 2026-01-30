import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const listDiamonds: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createDiamond: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDiamond: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDiamond: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=diamondController.d.ts.map