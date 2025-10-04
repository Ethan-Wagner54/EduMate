import axios from "axios";
import config from "../../config/Config";
import authService from "../auth/auth";

// Get API base URL from configuration
const API_URL = config.apiUrl;

export interface ProgressStats {
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  hoursStudied: number;
  activeModules: number;
  streak: number;
}

export interface ModuleProgress {
  name: string;
  code: string;
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  averageGrade: number;
  tutor: string;
}

export interface RecentActivity {
  date: string;
  activity: string;
  module: string;
  details: string;
  rating: number;
}

export interface StudentProgressResponse {
  stats: ProgressStats;
  moduleProgress: ModuleProgress[];
  recentActivity: RecentActivity[];
}

export interface PerformanceDataPoint {
  month: string;
  monthShort: string;
  averageGrade: number;
  sessionRating: number;
  sessionsCompleted: number;
  hoursStudied: number;
  modulesActive: number;
  attendanceRate: number;
}

export interface ModulePerformanceData {
  code: string;
  name: string;
  color: string;
  data: Array<{
    month: string;
    grade: number;
  }>;
  currentGrade: number;
  trend: 'up' | 'down';
}

/**
 * Get overall student progress data
 */
export const getStudentProgress = async (): Promise<{ success: boolean; data?: StudentProgressResponse; error?: string }> => {
  try {
    authService.setAuthHeader();
    
    const url = `${API_URL}/progress/student`;
    console.log(`Fetching student progress from: ${url}`);

    const response = await axios.get<StudentProgressResponse>(url);
    
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
    console.error('Error fetching student progress:', error);
    
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
 * Get performance data over time for charts
 */
export const getPerformanceData = async (months: number = 6): Promise<{ success: boolean; data?: PerformanceDataPoint[]; error?: string }> => {
  try {
    authService.setAuthHeader();
    
    const url = `${API_URL}/progress/performance?months=${months}`;
    console.log(`Fetching performance data from: ${url}`);

    const response = await axios.get<PerformanceDataPoint[]>(url);
    
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
    console.error('Error fetching performance data:', error);
    
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
 * Get module-specific performance data
 */
export const getModulePerformanceData = async (): Promise<{ success: boolean; data?: ModulePerformanceData[]; error?: string }> => {
  try {
    authService.setAuthHeader();
    
    const url = `${API_URL}/progress/modules`;
    console.log(`Fetching module performance data from: ${url}`);

    const response = await axios.get<ModulePerformanceData[]>(url);
    
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
    console.error('Error fetching module performance data:', error);
    
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

const progressService = {
  getStudentProgress,
  getPerformanceData,
  getModulePerformanceData
};

export default progressService;