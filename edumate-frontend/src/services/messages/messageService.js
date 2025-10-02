import axios from 'axios';
import config from '../../config/Config';
import authService from '../auth/auth';
import socketService from '../websocket/socketService';

const API_URL = config.apiUrl;

class MessageService {
  constructor() {
    this.messageCache = new Map();
    this.conversationCache = new Map();
    this.searchCache = new Map();
  }

  // Get conversation between current user and a tutor
  async getConversation(tutorId, options = {}) {
    try {
      authService.setAuthHeader();
      
      const {
        page = 1,
        limit = 50,
        before = null,
        after = null
      } = options;

      // Check cache first
      const cacheKey = `conversation-${tutorId}-${page}-${limit}`;
      if (this.conversationCache.has(cacheKey) && !after && !before) {
        return this.conversationCache.get(cacheKey);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (before) params.append('before', before);
      if (after) params.append('after', after);

      const response = await axios.get(`${API_URL}/messages/conversation/${tutorId}?${params}`);
      
      if (response.data && response.data.success) {
        // Cache the result
        this.conversationCache.set(cacheKey, response.data);
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to load conversation'
      };

    } catch (error) {
      console.error('Error fetching conversation:', error);
      
      // Return mock data for development
      return this.getMockConversation(tutorId);
    }
  }

  // Send a new message
  async sendMessage(messageData) {
    try {
      authService.setAuthHeader();
      
      const payload = {
        recipientId: messageData.recipientId,
        content: messageData.content,
        messageType: messageData.type || 'text',
        attachments: messageData.attachments || []
      };

      // Try to send via WebSocket first for real-time delivery
      if (socketService.isSocketConnected()) {
        try {
          const socketResponse = await socketService.sendMessage(payload);
          return {
            success: true,
            data: socketResponse
          };
        } catch (socketError) {
          console.warn('Socket send failed, falling back to HTTP:', socketError);
        }
      }

      // Fallback to HTTP API
      const response = await axios.post(`${API_URL}/messages`, payload);
      
      if (response.data && response.data.success) {
        // Clear relevant caches
        this.clearConversationCache(messageData.recipientId);
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to send message'
      };

    } catch (error) {
      console.error('Error sending message:', error);
      
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

  // Upload file attachment
  async uploadAttachment(file, messageId = null) {
    try {
      authService.setAuthHeader();
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 10MB.'
        };
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'File type not supported'
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      if (messageId) formData.append('messageId', messageId);

      const response = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can emit progress events here if needed
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        error: 'Upload failed'
      };

    } catch (error) {
      console.error('Error uploading attachment:', error);
      
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.message || 'Upload failed'
        };
      }

      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Search messages
  async searchMessages(query, options = {}) {
    try {
      authService.setAuthHeader();
      
      const {
        tutorId = null,
        page = 1,
        limit = 20,
        dateFrom = null,
        dateTo = null,
        messageType = null
      } = options;

      // Check cache
      const cacheKey = `search-${query}-${JSON.stringify(options)}`;
      if (this.searchCache.has(cacheKey)) {
        return this.searchCache.get(cacheKey);
      }

      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });

      if (tutorId) params.append('tutorId', tutorId);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (messageType) params.append('messageType', messageType);

      const response = await axios.get(`${API_URL}/messages/search?${params}`);
      
      if (response.data && response.data.success) {
        // Cache results for 5 minutes
        this.searchCache.set(cacheKey, response.data);
        setTimeout(() => {
          this.searchCache.delete(cacheKey);
        }, 5 * 60 * 1000);

        return response.data;
      }

      return {
        success: false,
        error: 'Search failed'
      };

    } catch (error) {
      console.error('Error searching messages:', error);
      
      return {
        success: false,
        error: 'Search failed'
      };
    }
  }

  // Get message history (all conversations)
  async getMessageHistory(options = {}) {
    try {
      authService.setAuthHeader();
      
      const {
        page = 1,
        limit = 20
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await axios.get(`${API_URL}/messages/history?${params}`);
      
      if (response.data && response.data.success) {
        return response.data;
      }

      return this.getMockMessageHistory();

    } catch (error) {
      console.error('Error fetching message history:', error);
      return this.getMockMessageHistory();
    }
  }

  // Mark messages as read
  async markAsRead(messageIds) {
    try {
      authService.setAuthHeader();
      
      // Try WebSocket first
      if (socketService.isSocketConnected()) {
        socketService.markMessagesAsRead(messageIds);
      }

      // Also update via API
      await axios.post(`${API_URL}/messages/mark-read`, {
        messageIds
      });

      return { success: true };

    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: 'Failed to mark messages as read' };
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      authService.setAuthHeader();
      
      const response = await axios.get(`${API_URL}/messages/unread-count`);
      
      if (response.data && response.data.success) {
        return response.data;
      }

      return { success: true, data: { count: 0 } };

    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: true, data: { count: 0 } };
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      authService.setAuthHeader();
      
      const response = await axios.delete(`${API_URL}/messages/${messageId}`);
      
      if (response.data && response.data.success) {
        // Clear caches
        this.clearAllCaches();
        return response.data;
      }

      return {
        success: false,
        error: 'Failed to delete message'
      };

    } catch (error) {
      console.error('Error deleting message:', error);
      return {
        success: false,
        error: 'Failed to delete message'
      };
    }
  }

  // Cache management
  clearConversationCache(tutorId) {
    for (const key of this.conversationCache.keys()) {
      if (key.startsWith(`conversation-${tutorId}`)) {
        this.conversationCache.delete(key);
      }
    }
  }

  clearSearchCache() {
    this.searchCache.clear();
  }

  clearAllCaches() {
    this.messageCache.clear();
    this.conversationCache.clear();
    this.searchCache.clear();
  }

  // Mock data for development
  getMockConversation(tutorId) {
    const currentUserId = authService.getUserId();
    
    return {
      success: true,
      data: {
        messages: [
          {
            id: 1,
            senderId: tutorId,
            senderName: "Sarah Johnson",
            recipientId: currentUserId,
            content: "Hi! I'm ready to help you with your studies. What topics would you like to focus on?",
            messageType: "text",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            attachments: []
          },
          {
            id: 2,
            senderId: currentUserId,
            senderName: "You",
            recipientId: tutorId,
            content: "Hello! I'm struggling with object-oriented programming concepts, especially inheritance and polymorphism.",
            messageType: "text",
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            attachments: []
          },
          {
            id: 3,
            senderId: tutorId,
            senderName: "Sarah Johnson",
            recipientId: currentUserId,
            content: "Perfect! Those are fundamental OOP concepts. I have some great examples we can work through. Would you like to schedule a session this week?",
            messageType: "text",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            attachments: []
          },
          {
            id: 4,
            senderId: currentUserId,
            senderName: "You",
            recipientId: tutorId,
            content: "Yes, that would be great! When are you available?",
            messageType: "text",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isRead: false,
            attachments: []
          }
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 4,
          hasMore: false
        }
      }
    };
  }

  getMockMessageHistory() {
    const currentUserId = authService.getUserId();
    
    return {
      success: true,
      data: {
        conversations: [
          {
            id: 1,
            participantId: 1,
            participantName: "Sarah Johnson",
            participantRole: "tutor",
            lastMessage: {
              content: "Yes, that would be great! When are you available?",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              isOwn: true
            },
            unreadCount: 0,
            totalMessages: 4
          },
          {
            id: 2,
            participantId: 2,
            participantName: "Michael Chen",
            participantRole: "tutor",
            lastMessage: {
              content: "I'll send you the practice problems we discussed.",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isOwn: false
            },
            unreadCount: 1,
            totalMessages: 8
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasMore: false
        }
      }
    };
  }
}

// Create singleton instance
const messageService = new MessageService();

export default messageService;