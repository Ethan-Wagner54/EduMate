/**
 * Authentication related type definitions
 */

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  userId?: string;
  userType?: string;
  role?: string;
  message?: string;
  error?: string;
}

/**
 * JWT Token Payload interface
 */
export interface JwtPayload {
  userId?: number;
  role?: string;
}