import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DiamondBid } from "../models/DiamondBid";
export declare const declareResultIfClosed: (diamondBid: DiamondBid) => Promise<DiamondBid | null>;
export declare const getAllBidsForDiamond: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/** Admin: full bid history for a diamond (every bid/update in chronological order) */
export declare const getBidHistoryForDiamond: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const declareResult: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listAllResults: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyResults: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=resultController.d.ts.map