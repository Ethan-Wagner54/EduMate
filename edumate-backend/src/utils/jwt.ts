import jwt from "jsonwebtoken";
import { env } from "../config";

// Defines the shape of the data we'll store in the token
interface TokenPayload {
  userId: number;
  role: string;
}

/**
 * Creates a new JWT token.
 * @param payload - The data to store in the token (e.g., user ID and role).
 * @returns The signed JWT token.
 */
export const generateToken = (payload: TokenPayload): string => {
  const expiresIn = "1d"; // Token will be valid for 1 day

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verifies a JWT token.
 * @param token - The JWT token to verify.
 * @returns The decoded payload if the token is valid.
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};