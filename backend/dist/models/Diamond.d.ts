import { Model, Optional } from "sequelize";
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
type DiamondCreationAttributes = Optional<DiamondAttributes, "id" | "imageUrl" | "carat" | "cut" | "color" | "clarity" | "basePrice">;
export declare class Diamond extends Model<DiamondAttributes, DiamondCreationAttributes> implements DiamondAttributes {
    id: number;
    name: string;
    diamondId: string;
    imageUrl: string | null;
    carat: number | null;
    cut: string | null;
    color: string | null;
    clarity: string | null;
    basePrice: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=Diamond.d.ts.map