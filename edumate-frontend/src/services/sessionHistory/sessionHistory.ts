import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import { exportToCSV, formatSessionHistoryForCSV } from '../../utils/csvExport';
import {
  SessionHistoryItem,
  SessionHistoryResponse,
  SessionReviewRequest,
  SessionReviewResponse,
  TutorSessionsResponse,
  SessionHistoryQueryParams
} from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch session history for the current user
 */
export const getSessionHistory = async (params?: SessionHistoryQueryParams): Promise<SessionHistoryResponse> => {
  try {
    authService.setAuthHeader();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    
    // Construct URL with query parameters
    const url = `${API_URL}/session-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Fetching session history from: ${url}`);
    
    const response = await axios.get<SessionHistoryItem[]>(url);
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
    console.error('Error fetching session history:', error);
    
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || 'Server error'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Submit a review for a session
 */
export const submitSessionReview = async (sessionId: number, rating: number, feedback?: string): Promise<SessionReviewResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log(`Submitting review for session ${sessionId}...`);
    
    const requestData: SessionReviewRequest = { rating, feedback };
    
    const response = await axios.post(`${API_URL}/session-history/sessions/${sessionId}/review`, requestData);
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
    console.error('Error submitting review:', error);
    
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || 'Server error'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Fetch sessions for a specific tutor
 */
export const getTutorSessions = async (tutorId: number): Promise<TutorSessionsResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log(`Fetching sessions for tutor ${tutorId}...`);
    
    const response = await axios.get(`${API_URL}/session-history/tutors/${tutorId}/sessions`);
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
    console.error('Error fetching tutor sessions:', error);
    
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || 'Server error'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Export session history data to CSV file
 */
export const exportSessionHistoryToCSV = async (params?: SessionHistoryQueryParams): Promise<void> => {
  try {
    console.log('Fetching session history for CSV export...');
    
    const response = await getSessionHistory(params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch session history');
    }
    
    const sessions = response.data;
    
    if (sessions.length === 0) {
      alert('No session data to export!');
      return;
    }
    
    // Format the session data for CSV export
    const formattedSessions = formatSessionHistoryForCSV(sessions);
    
    // Generate filename with current date and filter info
    const currentDate = new Date().toISOString().split('T')[0];
    const filterSuffix = params?.status && params.status !== 'all' ? `-${params.status}` : '';
    const filename = `session-history${filterSuffix}-${currentDate}.csv`;
    
    // Export to CSV
    exportToCSV(formattedSessions, { 
      filename,
      dateFormat: 'short'
    });
    
    console.log(`Exported ${sessions.length} sessions to ${filename}`);
  } catch (error: any) {
    console.error('Error exporting session history:', error);
    throw new Error(error.message || 'Failed to export session history');
  }
};

// Export default for easier imports
const sessionHistoryService = {
  getSessionHistory,
  submitSessionReview,
  getTutorSessions,
  exportSessionHistoryToCSV
};

export default sessionHistoryService;