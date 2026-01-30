import { Model, Optional } from "sequelize";
interface UserBidAttributes {
    id: number;
    userId: number;
    diamondBidId: number;
    currentBidAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
type UserBidCreationAttributes = Optional<UserBidAttributes, "id">;
export declare class UserBid extends Model<UserBidAttributes, UserBidCreationAttributes> implements UserBidAttributes {
    id: number;
    userId: number;
    diamondBidId: number;
    currentBidAmount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=UserBid.d.ts.map