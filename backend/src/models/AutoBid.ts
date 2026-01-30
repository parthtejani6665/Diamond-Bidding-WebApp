import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { DiamondBid } from "./DiamondBid";

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

export class AutoBid
  extends Model<AutoBidAttributes, AutoBidCreationAttributes>
  implements AutoBidAttributes
{
  public id!: number;
  public userId!: number;
  public diamondBidId!: number;
  public maxAmount!: number;
  public incrementAmount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AutoBid.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    diamondBidId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "diamond_bids", key: "id" },
      onDelete: "CASCADE",
    },
    maxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    incrementAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "auto_bids",
    sequelize,
    underscored: true,
    indexes: [{ unique: true, fields: ["user_id", "diamond_bid_id"] }],
  }
);

AutoBid.belongsTo(User, { foreignKey: "userId", as: "user" });
AutoBid.belongsTo(DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });

User.hasMany(AutoBid, { foreignKey: "userId", as: "autoBids" });
DiamondBid.hasMany(AutoBid, { foreignKey: "diamondBidId", as: "autoBids" });
