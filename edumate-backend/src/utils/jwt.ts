import jwt from "jsonwebtoken";
import { env } from "../config";

export interface JwtPayload { id: number; role: "student"|"tutor"|"admin"; }

export function signJwt(payload: JwtPayload, expiresIn = "7d") {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
