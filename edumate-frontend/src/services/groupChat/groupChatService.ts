import axiosInstance from '../../config/axios';
import config from '../../config/Config';
import socketService from '../websocket/socketService';
import {
  GroupChat,
  GroupChatMessage,
  GroupChatResponse,
  GroupChatListResponse,
  GroupChatMessagesResponse,
  SendGroupMessageRequest,
  SendGroupMessageResponse,
  CreateGroupChatRequest,
  GroupChatParticipant,
  MessageAttachment,
} from '../../types/groupChat';

const API_URL = config.apiUrl;

class GroupChatService {
  constructor() {
    this.groupChatCache = new Map();
    this.messagesCache = new Map();
  }

  /**
   * Get all group chats for the current user
   */
  async getGroupChats(options: { page?: number; limit?: number } = {}): Promise<GroupChatListResponse> {
    try {
      const { page = 1, limit = 20 } = options;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await axiosInstance.get(`/group-chats/groups?${params}`);
      
      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to load group chats'
      };

    } catch (error: any) {
      
      return {
        success: false,
        error: 'Failed to load group chats'
      };
    }
  }

  /**
   * Get group chat by session ID
   */
  async getGroupChatBySession(sessionId: number): Promise<GroupChatResponse> {
    try {
      const response = await axiosInstance.get(`/group-chats/session/${sessionId}`);
      
      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to load session group chat'
      };

    } catch (error: any) {
      
      return {
        success: false,
        error: 'Failed to load session group chat'
      };
    }
  }

  /**
   * Create a new group chat for a session
   */
  async createGroupChat(request: CreateGroupChatRequest): Promise<GroupChatResponse> {
    try {
      const response = await axiosInstance.post(`/group-chats/groups`, request);
      
      if (response.data && response.data.success) {
        // Clear cache
        this.groupChatCache.clear();
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to create group chat'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to create group chat'
        };
      }

      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Get messages for a group chat
   */
  async getGroupChatMessages(
    conversationId: number, 
    options: { page?: number; limit?: number; before?: string; after?: string } = {}
  ): Promise<GroupChatMessagesResponse> {
    try {
      const { page = 1, limit = 50, before, after } = options;
      
      // Check cache first
      const cacheKey = `messages-${conversationId}-${page}-${limit}`;
      if (this.messagesCache.has(cacheKey) && !before && !after) {
        return this.messagesCache.get(cacheKey);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (before) params.append('before', before);
      if (after) params.append('after', after);

      const response = await axiosInstance.get(`/group-chats/${conversationId}/messages?${params}`);
      
      if (response.data && response.data.success) {
        // Cache the result
        this.messagesCache.set(cacheKey, response.data);
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to load messages'
      };

    } catch (error: any) {
      
      return {
        success: false,
        error: 'Failed to load messages'
      };
    }
  }

  /**
   * Send a message to a group chat
   */
  async sendGroupMessage(request: SendGroupMessageRequest): Promise<SendGroupMessageResponse> {
    try {
      // Try to send via WebSocket first for real-time delivery
      if (socketService.isSocketConnected()) {
        try {
          const socketResponse = await socketService.sendGroupMessage(request);
          return {
            success: true,
            data: socketResponse
          };
        } catch (socketError) {
        }
      }

      // Fallback to HTTP API
      const response = await axiosInstance.post(`/group-chats/${request.conversationId}/messages`, {
        content: request.content,
        messageType: request.messageType || 'text',
        attachments: request.attachments || []
      });
      
      if (response.data && response.data.success) {
        // Clear relevant caches
        this.clearMessagesCache(request.conversationId);
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to send message'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to send message'
        };
      }

      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Join a group chat room via WebSocket
   */
  joinGroupChatRoom(conversationId: number) {
    if (socketService.isSocketConnected()) {
      socketService.joinGroupChatRoom(conversationId);
    }
  }

  /**
   * Leave a group chat room
   */
  leaveGroupChatRoom(conversationId: number) {
    socketService.leaveGroupChatRoom(conversationId);
  }

  /**
   * Mark messages as read in a group chat
   */
  async markGroupMessagesAsRead(conversationId: number, messageIds: number[]): Promise<{ success: boolean; error?: string }> {
    try {
      // Try WebSocket first
      if (socketService.isSocketConnected()) {
        socketService.markGroupMessagesAsRead(conversationId, messageIds);
      }

      // Also update via API
      await axiosInstance.post(`/group-chats/${conversationId}/mark-read`, {
        messageIds
      });

      return { success: true };

    } catch (error: any) {
      return { success: false, error: 'Failed to mark messages as read' };
    }
  }

  /**
   * Upload file attachment for group chat
   */
  async uploadGroupChatAttachment(
    file: File, 
    conversationId: number, 
    messageId?: string
  ): Promise<{ success: boolean; data?: MessageAttachment; error?: string }> {
    try {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 10MB.'
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId.toString());
      if (messageId) formData.append('messageId', messageId);

      const response = await axiosInstance.post(`/group-chats/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        error: 'Upload failed'
      };

    } catch (error: any) {
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  /**
   * Delete a group chat
   */
  async deleteGroupChat(conversationId: number): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await axiosInstance.delete(`/group-chats/${conversationId}`);
      
      if (response.data && response.data.success) {
        // Clear caches
        this.clearGroupChatCache();
        this.clearMessagesCache(conversationId);
        
        return response.data;
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to delete group chat'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.error || 'Failed to delete group chat'
        };
      }

      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Leave a group chat
   */
  async leaveGroupChat(conversationId: number): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await axiosInstance.post(`/group-chats/${conversationId}/leave`);
      
      if (response.data && response.data.success) {
        // Clear caches
        this.clearGroupChatCache();
        this.clearMessagesCache(conversationId);
        
        return response.data;
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to leave group chat'
      };

    } catch (error: any) {
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.error || 'Failed to leave group chat'
        };
      }

      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Cache management
   */
  clearGroupChatCache() {
    this.groupChatCache.clear();
  }

  clearMessagesCache(conversationId?: number) {
    if (conversationId) {
      for (const key of this.messagesCache.keys()) {
        if (key.startsWith(`messages-${conversationId}`)) {
          this.messagesCache.delete(key);
        }
      }
    } else {
      this.messagesCache.clear();
    }
  }

  clearAllCaches() {
    this.groupChatCache.clear();
    this.messagesCache.clear();
  }

}

// Create singleton instance
const groupChatService = new GroupChatService();

export default groupChatService;