import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

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

type DiamondBidCreationAttributes = Optional<
  DiamondBidAttributes,
  "id" | "status" | "resultDeclared" | "winnerId" | "declaredAt"
>;

export class DiamondBid
  extends Model<DiamondBidAttributes, DiamondBidCreationAttributes>
  implements DiamondBidAttributes
{
  public id!: number;
  public diamondName!: string;
  public diamondId!: string;
  public diamondImageUrl!: string | null;
  public baseDiamondPrice!: number;
  public baseBidPrice!: number;
  public startDateTime!: Date;
  public endDateTime!: Date;
  public status!: BidStatus;
  public createdBy!: number;
  public resultDeclared!: boolean;
  public winnerId!: number | null;
  public declaredAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DiamondBid.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    diamondName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diamondId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diamondImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baseDiamondPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    baseBidPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    startDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "closed"),
      allowNull: false,
      defaultValue: "draft",
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    resultDeclared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    winnerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    declaredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "diamond_bids",
    sequelize,
  }
);

DiamondBid.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
DiamondBid.belongsTo(User, { foreignKey: "winnerId", as: "winner" });

