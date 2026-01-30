import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const createDiamondBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listDiamondBids: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDiamondBidById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDiamondBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDiamondBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=diamondBidController.d.ts.map