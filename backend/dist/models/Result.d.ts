import { Model, Optional } from "sequelize";
interface ResultAttributes {
    id: number;
    diamondBidId: number;
    winnerId: number;
    winningAmount: number;
    declaredAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
type ResultCreationAttributes = Optional<ResultAttributes, "id" | "createdAt" | "updatedAt">;
export declare class Result extends Model<ResultAttributes, ResultCreationAttributes> implements ResultAttributes {
    id: number;
    diamondBidId: number;
    winnerId: number;
    winningAmount: number;
    declaredAt: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=Result.d.ts.map