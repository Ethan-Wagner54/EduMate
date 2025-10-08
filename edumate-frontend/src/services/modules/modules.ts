import axiosInstance from '../../config/axios';
import config from '../../config/Config';
import { ModulesResponse } from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch all available modules
 */
export const getModules = async (): Promise<ModulesResponse> => {
  try {
    
    const response = await axiosInstance.get<any>(`/modules`);
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
 * Fetch modules that the authenticated tutor is approved to teach
 */
export const getTutorModules = async (): Promise<ModulesResponse> => {
  try {
    
    const response = await axiosInstance.get<any>(`/modules/tutor`);
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
const moduleService = {
  getModules,
  getTutorModules
};

export default moduleService;
