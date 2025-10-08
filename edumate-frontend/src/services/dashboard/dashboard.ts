import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import {
  DashboardStats,
  DashboardResponse,
  Activity,
  ActivitiesResponse,
  UpcomingSession,
  UpcomingSessionsResponse,
  TutorProgress,
  TutorProgressResponse
} from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardResponse<DashboardStats>> => {
  try {
    authService.setAuthHeader();
    
    
    const response = await axios.get<DashboardStats>(`${API_URL}/dashboard/stats`);
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
 * Fetch recent activities
 */
export const getRecentActivities = async (): Promise<ActivitiesResponse> => {
  try {
    authService.setAuthHeader();
    
    
    const response = await axios.get<Activity[]>(`${API_URL}/dashboard/activities`);
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
 * Fetch upcoming sessions
 */
export const getUpcomingSessions = async (): Promise<UpcomingSessionsResponse> => {
  try {
    authService.setAuthHeader();
    
    
    const response = await axios.get<UpcomingSession[]>(`${API_URL}/dashboard/upcoming-sessions`);
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
 * Fetch tutor progress
 */
export const getTutorProgress = async (): Promise<TutorProgressResponse> => {
  try {
    authService.setAuthHeader();
    
    
    const response = await axios.get<TutorProgress[]>(`${API_URL}/dashboard/tutor-progress`);
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

// Export default for easier imports
const dashboardService = {
  getDashboardStats,
  getRecentActivities,
  getUpcomingSessions,
  getTutorProgress
};

export default dashboardService;