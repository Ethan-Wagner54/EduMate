/**
 * Session service related type definitions
 */

/**
 * Session interface representing a tutoring session
 */
export interface Session {
  id: number;
  tutorId: number;
  moduleId: number;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  status: string;
  createdAt: string;
}

/**
 * Parameters for fetching sessions
 */
export interface SessionQueryParams {
  moduleId?: string | number;
  tutorId?: string | number;
}

/**
 * Response from the sessions API for multiple sessions
 */
export interface SessionsResponse {
  success: boolean;
  data?: Session[];
  error?: string;
  message?: string;
}

/**
 * Parameters for creating a new session
 */
export interface CreateSessionParams {
  moduleId: number;
  startTime: string;
  endTime: string;
  location?: string;
  capacity?: number;
}

/**
 * Response from the create session API
 */
export interface CreateSessionResponse {
  success: boolean;
  data?: Session;
  error?: string;
  message?: string;
}
