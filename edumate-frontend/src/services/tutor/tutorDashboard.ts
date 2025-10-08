import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';

const API_URL = config.apiUrl;

export interface TutorDashboardData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  specialties: string[];
  isOnline: boolean;
  modules: Array<{
    code: string;
    name: string;
    faculty: string;
    approved: boolean;
  }>;
  stats: {
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    upcomingSessions: number;
  };
  recentSessions: Array<{
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    enrolledStudents: number;
    status: string;
    students: Array<{
      id: number;
      name: string;
    }>;
  }>;
  upcomingSessions: Array<{
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    enrolledStudents: number;
    students: Array<{
      id: number;
      name: string;
    }>;
  }>;
}

export interface TutorDashboardResponse {
  success: boolean;
  data?: TutorDashboardData;
  error?: string;
}

/**
 * Get tutor dashboard data
 */
export const getTutorDashboard = async (): Promise<TutorDashboardResponse> => {
  try {
    
    // Ensure auth header is set
    authService.setAuthHeader();
    
    const response = await axios.get<TutorDashboardData>(`${API_URL}/tutor-dashboard`);
    
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

const tutorDashboardService = {
  getTutorDashboard
};

export default tutorDashboardService;