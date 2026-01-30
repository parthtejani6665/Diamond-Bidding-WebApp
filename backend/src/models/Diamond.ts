import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface DiamondAttributes {
  id: number;
  name: string;
  diamondId: string;
  imageUrl?: string | null;
  carat?: number | null;
  cut?: string | null;
  color?: string | null;
  clarity?: string | null;
  basePrice?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type DiamondCreationAttributes = Optional<
  DiamondAttributes,
  "id" | "imageUrl" | "carat" | "cut" | "color" | "clarity" | "basePrice"
>;

export class Diamond
  extends Model<DiamondAttributes, DiamondCreationAttributes>
  implements DiamondAttributes
{
  public id!: number;
  public name!: string;
  public diamondId!: string;
  public imageUrl!: string | null;
  public carat!: number | null;
  public cut!: string | null;
  public color!: string | null;
  public clarity!: string | null;
  public basePrice!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Diamond.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diamondId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    carat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cut: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clarity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
  },
  {
    tableName: "diamonds",
    sequelize,
  }
);
