/**
 * User service related type definitions
 */

/**
 * User interface representing a user in the system
 */
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

/**
 * Parameters for fetching users
 */
export interface GetUserQueryParams {
  id: number;
}


/**
 * Response from the user API for fetching a user
 */
export interface GetUserResponse {
    success: boolean;
    data?: User;
    error?: string;
    message?: string;
}