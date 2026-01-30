import { sign, verify } from "jsonwebtoken";
import { UserRole } from "../models/User";

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

const JWT_SECRET = (process.env.JWT_SECRET || "dev_jwt_secret") as unknown as any;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const signToken = (payload: JwtPayload): string => {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return verify(token, JWT_SECRET) as JwtPayload;
};

