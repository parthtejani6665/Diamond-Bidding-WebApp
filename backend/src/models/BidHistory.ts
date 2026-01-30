import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { DiamondBid } from "./DiamondBid";
import { UserBid } from "./UserBid";

interface BidHistoryAttributes {
  id: number;
  userBidId: number;
  userId: number;
  diamondBidId: number;
  bidAmount: number;
  editedAt: Date;
}

type BidHistoryCreationAttributes = Optional<BidHistoryAttributes, "id" | "editedAt">;

export class BidHistory
  extends Model<BidHistoryAttributes, BidHistoryCreationAttributes>
  implements BidHistoryAttributes
{
  public id!: number;
  public userBidId!: number;
  public userId!: number;
  public diamondBidId!: number;
  public bidAmount!: number;
  public editedAt!: Date;
}

BidHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userBidId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "user_bids",
        key: "id",
      },
      onDelete: "CASCADE",
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
    bidAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bid_history",
    sequelize,
    timestamps: false,
  }
);

BidHistory.belongsTo(UserBid, { foreignKey: "userBidId", as: "userBid" });
BidHistory.belongsTo(User, { foreignKey: "userId", as: "user" });
BidHistory.belongsTo(DiamondBid, { foreignKey: "diamondBidId", as: "diamondBid" });

UserBid.hasMany(BidHistory, { foreignKey: "userBidId", as: "history" });
User.hasMany(BidHistory, { foreignKey: "userId", as: "bidHistory" });
DiamondBid.hasMany(BidHistory, { foreignKey: "diamondBidId", as: "bidHistory" });

