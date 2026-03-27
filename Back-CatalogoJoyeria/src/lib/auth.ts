import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";
const TOKEN_EXPIRES_IN = "7d";

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
