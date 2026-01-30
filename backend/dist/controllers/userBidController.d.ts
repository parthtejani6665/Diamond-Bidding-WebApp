import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const listActiveDiamondBids: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const placeBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBidHistory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listMyBids: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAutoBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setAutoBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAutoBid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=userBidController.d.ts.map