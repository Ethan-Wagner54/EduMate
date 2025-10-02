import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import {
  Session,
  SessionQueryParams,
  SessionsResponse,
  CreateSessionParams,
  CreateSessionResponse
} from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch sessions based on optional filter parameters
 */
export const getSessions = async (params?: SessionQueryParams): Promise<SessionsResponse> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.moduleId) {
      queryParams.append('moduleId', params.moduleId.toString());
    }
    if (params?.tutorId) {
      queryParams.append('tutorId', params.tutorId.toString());
    }
    
    // Construct URL with query parameters
    const url = `${API_URL}/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Fetching sessions from: ${url}`);
    
    const response = await axios.get<any>(url);
    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'No data received from the server'
    };
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    
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
 * Create a new session
 */
export const createSession = async (params: CreateSessionParams): Promise<CreateSessionResponse> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log('Creating session with params:', params);
    
    const response = await axios.post<any>(`${API_URL}/sessions`, params);
    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'No data received from the server'
    };
  } catch (error: any) {
    console.error('Error creating session:', error);
    
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
 * Delete a session
 */
export const deleteSession = async (sessionId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log(`Deleting session ${sessionId}`);
    
    await axios.delete(`${API_URL}/sessions/${sessionId}`);
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting session:', error);
    
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
 * Join a session
 */
export const joinSession = async (sessionId: number): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log(`Joining session ${sessionId}`);
    
    const response = await axios.post(`${API_URL}/sessions/${sessionId}/join`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error joining session:', error);
    
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
 * Update session status
 */
export const updateSessionStatus = async (sessionId: number, status: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log(`Updating session ${sessionId} status to ${status}`);
    
    await axios.patch(`${API_URL}/sessions/${sessionId}/status`, { status });
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error updating session status:', error);
    
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
 * Fetch sessions for a specific user
 */
export const getUserSessions = async (userId: number): Promise<SessionsResponse> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log(`Fetching sessions for user ${userId}`);
    
    const response = await axios.get<any>(`${API_URL}/sessions/user/${userId}`);
    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'No data received from the server'
    };
  } catch (error: any) {
    console.error('Error fetching user sessions:', error);
    
    // Check if there's a response with error message
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || 'Server error'
      };
    }
    
    // Generic error - fallback to regular sessions
    return await getSessions();
  }
};

// Export default for easier imports
const sessionService = {
  getSessions,
  createSession,
  getUserSessions,
  deleteSession,
  updateSessionStatus,
  joinSession
};

export default sessionService;
