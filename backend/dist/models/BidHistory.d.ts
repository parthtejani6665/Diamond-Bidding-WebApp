import { Model, Optional } from "sequelize";
interface BidHistoryAttributes {
    id: number;
    userBidId: number;
    userId: number;
    diamondBidId: number;
    bidAmount: number;
    editedAt: Date;
}
type BidHistoryCreationAttributes = Optional<BidHistoryAttributes, "id" | "editedAt">;
export declare class BidHistory extends Model<BidHistoryAttributes, BidHistoryCreationAttributes> implements BidHistoryAttributes {
    id: number;
    userBidId: number;
    userId: number;
    diamondBidId: number;
    bidAmount: number;
    editedAt: Date;
}
export {};
//# sourceMappingURL=BidHistory.d.ts.map