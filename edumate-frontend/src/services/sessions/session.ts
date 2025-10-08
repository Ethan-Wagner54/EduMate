import axiosInstance from '../../config/axios';
import config from '../../config/Config';
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
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.moduleId) {
      queryParams.append('moduleId', params.moduleId.toString());
    }
    if (params?.tutorId) {
      queryParams.append('tutorId', params.tutorId.toString());
    }
    
    // Construct URL with query parameters
    const url = `/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Fetching sessions from: ${url}`);
    
    const response = await axiosInstance.get<any>(url);
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
    console.log('Creating session with params:', params);
    
    const response = await axiosInstance.post<any>(`/sessions`, params);
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
    console.log(`Deleting session ${sessionId}`);
    
    await axiosInstance.delete(`/sessions/${sessionId}`);
    
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
    console.log(`Joining session ${sessionId}`);
    
    const response = await axiosInstance.post(`/sessions/${sessionId}/join`);
    
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
 * Leave a session
 */
export const leaveSession = async (sessionId: number): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log(`Leaving session ${sessionId}`);
    
    const response = await axiosInstance.post(`/sessions/${sessionId}/leave`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error leaving session:', error);
    
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
 * Edit a session (tutors only)
 */
export const editSession = async (sessionId: number, params: Partial<CreateSessionParams>): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log(`Editing session ${sessionId}`, params);
    
    const response = await axiosInstance.put(`/sessions/${sessionId}`, params);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error editing session:', error);
    
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
 * Get session details
 */
export const getSessionDetails = async (sessionId: number): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log(`Getting session details ${sessionId}`);
    
    const response = await axiosInstance.get(`/sessions/${sessionId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error getting session details:', error);
    
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
    console.log(`Updating session ${sessionId} status to ${status}`);
    
    await axiosInstance.patch(`/sessions/${sessionId}/status`, { status });
    
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
 * Fetch sessions for the current user
 * For students: returns enrolled sessions
 * For tutors: returns created sessions
 */
export const getUserSessions = async (): Promise<SessionsResponse> => {
  try {
    console.log('Fetching user sessions');
    
    const response = await axiosInstance.get<any>(`/sessions/my-sessions`);
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
    
    // Generic error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

// Export default for easier imports
const sessionService = {
  getSessions,
  createSession,
  getUserSessions,
  deleteSession,
  updateSessionStatus,
  joinSession,
  leaveSession,
  editSession,
  getSessionDetails
};

export default sessionService;
