import { DiamondBid } from "../models/DiamondBid";
export type BidStatus = "draft" | "active" | "closed";
export declare const computeStatus: (start: Date, end: Date, now?: Date) => BidStatus;
export declare const refreshBidStatus: (bid: DiamondBid) => Promise<DiamondBid>;
//# sourceMappingURL=bidStatus.d.ts.map