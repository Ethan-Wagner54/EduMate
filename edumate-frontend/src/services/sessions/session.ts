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
    
    await axiosInstance.delete(`/sessions/${sessionId}`);
    
    return {
      success: true
    };
  } catch (error: any) {
    
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
    
    const response = await axiosInstance.post(`/sessions/${sessionId}/join`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    
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
 * Leave a session (students only)
 */
export const leaveSession = async (sessionId: number): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    
    const response = await axiosInstance.post(`/sessions/${sessionId}/leave`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    
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
 * Cancel a session (tutors only)
 */
export const cancelSession = async (sessionId: number, reason?: string): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    
    const response = await axiosInstance.post(`/sessions/${sessionId}/cancel`, { reason });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    
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
    
    const response = await axiosInstance.put(`/sessions/${sessionId}`, params);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    
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
    
    const response = await axiosInstance.get(`/sessions/${sessionId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    
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
    
    await axiosInstance.patch(`/sessions/${sessionId}/status`, { status });
    
    return {
      success: true
    };
  } catch (error: any) {
    
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
  cancelSession,
  editSession,
  getSessionDetails
};

export default sessionService;
