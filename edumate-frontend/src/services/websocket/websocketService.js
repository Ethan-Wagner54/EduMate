import { io } from 'socket.io-client';
import authService from '../auth/auth';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
  }

  /**
   * Initialize WebSocket connection
   */
  connect() {
    const token = authService.getToken();
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return;
    }

    try {
      this.socket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      this.setupEventHandlers();
      this.startHeartbeat();

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  /**
   * Setup event handlers for WebSocket connection
   */
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user room for receiving notifications
      const userInfo = authService.getUser();
      if (userInfo?.userId) {
        this.socket.emit('join-user-room', userInfo.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      this.stopHeartbeat();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.stopHeartbeat();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to WebSocket server after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    // Handle authentication errors
    this.socket.on('error', (error) => {
      if (error.message.includes('Authentication error')) {
        console.error('WebSocket authentication failed:', error);
        this.disconnect();
        // Could trigger re-login flow here
      }
    });
  }

  /**
   * Start sending heartbeat pings to keep connection alive and track activity
   */
  startHeartbeat() {
    // Send activity ping every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping-activity');
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
  }

  /**
   * Check if connected to WebSocket server
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(messageIds, conversationId = null) {
    if (this.isSocketConnected()) {
      const data = {};
      if (messageIds && messageIds.length > 0) {
        data.messageIds = messageIds;
      }
      if (conversationId) {
        data.conversationId = conversationId;
      }
      this.socket.emit('mark-messages-read', data);
    }
  }

  /**
   * Send a message (for messaging features)
   */
  sendMessage(recipientId, content, messageType = 'text') {
    if (!this.isSocketConnected()) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send-message', {
        recipientId,
        content,
        messageType
      }, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send a group message
   */
  sendGroupMessage(conversationId, content, messageType = 'text') {
    if (!this.isSocketConnected()) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send-group-message', {
        conversationId,
        content,
        messageType
      }, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Join a group chat room
   */
  joinGroupChat(conversationId) {
    if (this.isSocketConnected()) {
      this.socket.emit('join-group-chat', conversationId);
    }
  }

  /**
   * Leave a group chat room
   */
  leaveGroupChat(conversationId) {
    if (this.isSocketConnected()) {
      this.socket.emit('leave-group-chat', conversationId);
    }
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  /**
   * Listen for new group messages
   */
  onNewGroupMessage(callback) {
    if (this.socket) {
      this.socket.on('new-group-message', callback);
    }
  }

  /**
   * Remove message listeners
   */
  offNewMessage(callback) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  /**
   * Remove group message listeners
   */
  offNewGroupMessage(callback) {
    if (this.socket) {
      this.socket.off('new-group-message', callback);
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;