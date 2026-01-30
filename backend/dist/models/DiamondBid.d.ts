import { Model, Optional } from "sequelize";
type BidStatus = "draft" | "active" | "closed";
interface DiamondBidAttributes {
    id: number;
    diamondName: string;
    diamondId: string;
    diamondImageUrl?: string | null;
    baseDiamondPrice: number;
    baseBidPrice: number;
    startDateTime: Date;
    endDateTime: Date;
    status: BidStatus;
    createdBy: number;
    resultDeclared: boolean;
    winnerId?: number | null;
    declaredAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
type DiamondBidCreationAttributes = Optional<DiamondBidAttributes, "id" | "status" | "resultDeclared" | "winnerId" | "declaredAt">;
export declare class DiamondBid extends Model<DiamondBidAttributes, DiamondBidCreationAttributes> implements DiamondBidAttributes {
    id: number;
    diamondName: string;
    diamondId: string;
    diamondImageUrl: string | null;
    baseDiamondPrice: number;
    baseBidPrice: number;
    startDateTime: Date;
    endDateTime: Date;
    status: BidStatus;
    createdBy: number;
    resultDeclared: boolean;
    winnerId: number | null;
    declaredAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=DiamondBid.d.ts.map