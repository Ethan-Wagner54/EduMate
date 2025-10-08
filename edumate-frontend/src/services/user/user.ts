import axios from "axios";
import config from "../../config/Config";
import authService from "../auth/auth";
import { GetUserQueryParams, GetUserResponse } from "./types";

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch user details based on optional filter parameters
 */
export const getUser = async (params?: GetUserQueryParams): Promise<GetUserResponse> => {
  try {
    // Ensure auth header is set
    // debugger;
    
    authService.setAuthHeader();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.id) {
      queryParams.append('id', params.id.toString());
    }
    
    // Construct URL with query parameters
    const url = `${API_URL}/user${queryParams.toString() ? '?' + queryParams.toString() : ''}`;


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
 * Update user profile
 */
export const updateProfile = async (profileData: any): Promise<GetUserResponse> => {
  try {
    authService.setAuthHeader();
    
    const url = `${API_URL}/user/profile`;
    
    const response = await axios.put<any>(url, profileData);
    
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

const userService = {
    getUser,
    updateProfile
};

export default userService;
    