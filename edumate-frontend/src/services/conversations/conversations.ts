import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import {
  Conversation,
  ConversationsResponse,
  Message,
  MessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  ConversationResponse
} from './types';

// Get API base URL from configuration
const API_URL = config.apiUrl;

/**
 * Fetch all conversations for the current user
 */
export const getConversations = async (): Promise<ConversationsResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log('Fetching conversations...');
    
    const response = await axios.get<Conversation[]>(`${API_URL}/conversations`);
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
    console.error('Error fetching conversations:', error);
    
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
 * Fetch a specific conversation
 */
export const getConversation = async (conversationId: number): Promise<ConversationResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log(`Fetching conversation ${conversationId}...`);
    
    const response = await axios.get<Conversation>(`${API_URL}/conversations/${conversationId}`);
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
    console.error('Error fetching conversation:', error);
    
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
 * Fetch messages for a specific conversation
 */
export const getMessages = async (conversationId: number): Promise<MessagesResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log(`Fetching messages for conversation ${conversationId}...`);
    
    const response = await axios.get<Message[]>(`${API_URL}/conversations/${conversationId}/messages`);
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
    console.error('Error fetching messages:', error);
    
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
 * Send a message to a conversation
 */
export const sendMessage = async (conversationId: number, content: string): Promise<SendMessageResponse> => {
  try {
    authService.setAuthHeader();
    
    console.log(`Sending message to conversation ${conversationId}...`);
    
    const requestData: SendMessageRequest = { content };
    
    const response = await axios.post<Message>(`${API_URL}/conversations/${conversationId}/messages`, requestData);
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
    console.error('Error sending message:', error);
    
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
 * Create or get a direct conversation with a participant
 */
export const createOrGetConversation = async (participantId: number) => {
  try {
    authService.setAuthHeader();

    const res = await axios.post(`${API_URL}/conversations`, { participantId });
    if (res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, error: 'No data received from the server' };
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    if (error.response && error.response.data) {
      return { success: false, error: error.response.data.message || error.response.data.error || 'Server error' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
};

// Export default for easier imports
const conversationsService = {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  createOrGetConversation
};

export default conversationsService;
