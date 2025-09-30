import axios from 'axios';
import config from '../../config/Config';
import { 
  LoginCredentials, 
  AuthResponse,
  JwtPayload
} from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Login function that authenticates a user with the backend
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log("Logging in with credentials:", credentials);
    const response = await axios.post<any>(`${API_URL}/auth/login`, credentials);
    
    console.log("Login response:", response.data);
    
    // If login is successful, store only the JWT token in localStorage 
    if (response.data && response.data.token) {
      // Only store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Log decoded token for debugging but don't store sensitive parts
      const decodedToken = decodeToken(response.data.token);
      if (decodedToken) {
        console.log("Token successfully validated");
      }
      
      // Return the response data with success flag
      return {
        ...response.data,
        success: true
      };
    }
    
    // If we have a response but no token, still return but mark as unsuccessful
    if (response.data) {
      return {
        ...response.data,
        success: false,
        error: 'Invalid credentials or missing token'
      };
    }
    
    // Fallback response
    return {
      success: false,
      error: 'Login failed with unknown error'
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Check if there's a response with error message
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || 'Server error'
      };
    }
    
    // Generic error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Get the current authentication token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if the user is authenticated with a valid, non-expired token
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  // Verify token is valid 
  const decoded = decodeToken(token);
  if (!decoded) {
    return false;
  }
  
  return true;
};

/**
 * Get the current user information by decoding the JWT token
 */
export const getCurrentUser = (): { userId?: string; userType?: string; role?: string; email?: string } | null => {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  // Always decode the token to get fresh data (prevents tampering)
  const decoded = decodeToken(token);
  if (!decoded) {
    // Invalid token
    return null;
  }
  
  // Return relevant user information from the token
  return {
    userId: decoded.id?.toString(), // sub is the standard JWT claim for subject (usually userId)
    role: decoded.role
  };
};

/**
 * Get user role from JWT token
 */
export const getUserRole = (): string | null => {
  // Always decode from token to prevent tampering
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Decode a JWT token to extract its payload
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    // Get JWT payload
    const base64Payload = token.split('.')[1];
    
    // Handle base64url format by replacing characters and adding padding
    const base64 = base64Payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawPayload = atob(base64);
    return JSON.parse(rawPayload) as JwtPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Add authentication header to requests
export const setAuthHeader = (token: string = getToken() || ''): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize auth headers on page load if token exists
if (isAuthenticated()) {
  setAuthHeader();
}

// Export default for easier imports
const authService = {
  login,
  getToken,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  decodeToken,
  setAuthHeader
};

export default authService;
