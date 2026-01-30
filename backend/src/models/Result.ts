import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { DiamondBid } from "./DiamondBid";

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

export class Result
  extends Model<ResultAttributes, ResultCreationAttributes>
  implements ResultAttributes
{
  public id!: number;
  public diamondBidId!: number;
  public winnerId!: number;
  public winningAmount!: number;
  public declaredAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Result.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    diamondBidId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "diamond_bids",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    winnerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    winningAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    declaredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "results",
    sequelize,
  }
);

Result.belongsTo(User, { foreignKey: "winnerId", as: "winner" });
Result.belongsTo(DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });

User.hasMany(Result, { foreignKey: "winnerId", as: "wonResults" });
DiamondBid.hasOne(Result, { foreignKey: "diamondBidId", as: "result" });
