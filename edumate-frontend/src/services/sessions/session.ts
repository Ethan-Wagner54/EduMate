import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import {
  Session,
  SessionQueryParams,
  SessionsResponse
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

// Export default for easier imports
const sessionService = {
  getSessions
};

export default sessionService;
