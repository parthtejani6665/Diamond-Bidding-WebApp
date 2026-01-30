import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { DiamondBid } from "./DiamondBid";

interface UserBidAttributes {
  id: number;
  userId: number;
  diamondBidId: number;
  currentBidAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserBidCreationAttributes = Optional<UserBidAttributes, "id">;

export class UserBid
  extends Model<UserBidAttributes, UserBidCreationAttributes>
  implements UserBidAttributes
{
  public id!: number;
  public userId!: number;
  public diamondBidId!: number;
  public currentBidAmount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserBid.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
    currentBidAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "user_bids",
    sequelize,
  }
);

UserBid.belongsTo(User, { foreignKey: "userId", as: "user" });
UserBid.belongsTo(DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });

User.hasMany(UserBid, { foreignKey: "userId", as: "bids" });
DiamondBid.hasMany(UserBid, { foreignKey: "diamondBidId", as: "userBids" });

