import { Model, Optional } from "sequelize";
export type UserRole = "admin" | "user";
interface UserAttributes {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
type UserCreationAttributes = Optional<UserAttributes, "id" | "role" | "isActive">;
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=User.d.ts.map