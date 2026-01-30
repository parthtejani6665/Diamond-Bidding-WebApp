import { Model, Optional } from "sequelize";
interface AutoBidAttributes {
    id: number;
    userId: number;
    diamondBidId: number;
    maxAmount: number;
    incrementAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
type AutoBidCreationAttributes = Optional<AutoBidAttributes, "id">;
export declare class AutoBid extends Model<AutoBidAttributes, AutoBidCreationAttributes> implements AutoBidAttributes {
    id: number;
    userId: number;
    diamondBidId: number;
    maxAmount: number;
    incrementAmount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=AutoBid.d.ts.map