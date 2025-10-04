import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import { ModulesResponse } from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch all available modules
 */
export const getModules = async (): Promise<ModulesResponse> => {
  try {
    // Ensure auth header is set
    authService.setAuthHeader();
    
    console.log(`Fetching modules from: ${API_URL}/modules`);
    
    const response = await axios.get<any>(`${API_URL}/modules`);
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
    console.error('Error fetching modules:', error);
    
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
  getModules
};

export default moduleService;