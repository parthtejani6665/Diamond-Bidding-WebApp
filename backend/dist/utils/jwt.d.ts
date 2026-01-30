import { UserRole } from "../models/User";
export interface JwtPayload {
    id: number;
    email: string;
    role: UserRole;
}
export declare const signToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map