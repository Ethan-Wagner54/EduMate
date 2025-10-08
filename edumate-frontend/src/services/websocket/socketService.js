import { io } from 'socket.io-client';
import config from '../../config/Config';
import authService from '../auth/auth';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.messageListeners = new Set();
    this.connectionListeners = new Set();
    this.notificationListeners = new Set();
    this.groupMessageListeners = new Set();
    this.groupTypingListeners = new Set();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('SocketService: Already connected, skipping');
      return Promise.resolve();
    }

    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('No authentication token');
    }

    // Socket.io connection with auth (reduced logging)
    this.socket = io(config.apiUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    return new Promise((resolve, reject) => {
      // Connection successful
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Join user room for private messages
        const userId = authService.getUserId();
        if (userId) {
          this.socket.emit('join-user-room', userId);
        }

        // Notify listeners
        this.connectionListeners.forEach(listener => {
          try {
            listener({ connected: true, socketId: this.socket.id });
          } catch (error) {
            console.error('SocketService: Connection listener error:', error);
          }
        });

        resolve();
      });

      // Connection failed
      this.socket.on('connect_error', (error) => {
        console.error('SocketService: Connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          
          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          reject(error);
        }
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        
        // Notify listeners
        this.connectionListeners.forEach(listener => {
          try {
            listener({ connected: false, reason });
          } catch (error) {
          }
        });

        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          setTimeout(() => this.connect(), 2000);
        }
      });

      // Listen for new messages
      this.socket.on('new-message', (messageData) => {
        this.messageListeners.forEach(listener => {
          try {
            listener(messageData);
          } catch (error) {
            console.error('SocketService: Message listener error:', error);
          }
        });

        // Show notification if page is not visible
        if (document.hidden && 'Notification' in window) {
          this.showNotification(messageData);
        }
      });

      // Listen for message status updates
      this.socket.on('message-status', (statusData) => {
        // You can add status listeners here if needed
      });

      // Listen for typing indicators
      this.socket.on('user-typing', (typingData) => {
        // Handle typing indicators
      });

      // Listen for group messages
      this.socket.on('new-group-message', (messageData) => {
        this.groupMessageListeners.forEach(listener => {
          try {
            listener(messageData);
          } catch (error) {
            console.error('SocketService: Group message listener error:', error);
          }
        });

        // Show notification if page is not visible
        if (document.hidden && 'Notification' in window) {
          this.showNotification(messageData);
        }
      });

      // Listen for group typing indicators
      this.socket.on('group-user-typing', (typingData) => {
        this.groupTypingListeners.forEach(listener => {
          try {
            listener(typingData);
          } catch (error) {
          }
        });
      });

      // Authentication error
      this.socket.on('auth-error', (error) => {
        console.error('SocketService: Authentication error received:', error);
        this.disconnect();
        reject(error);
      });
      
      // Generic error handling
      this.socket.on('error', (error) => {
        console.error('SocketService: Socket error:', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send-message', messageData, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Join a chat room (conversation between user and tutor)
  joinChatRoom(roomId) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('join-chat-room', roomId);
  }

  // Leave a chat room
  leaveChatRoom(roomId) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave-chat-room', roomId);
  }

  // Send typing indicator
  sendTyping(roomId, isTyping = true) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing', { roomId, isTyping });
  }

  // Mark messages as read
  markMessagesAsRead(messageIds) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('mark-messages-read', messageIds);
  }

  // Group chat methods
  
  // Send a group message
  sendGroupMessage(messageData) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send-group-message', messageData, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Join a group chat room
  joinGroupChatRoom(conversationId) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('join-group-chat', conversationId);
  }

  // Leave a group chat room
  leaveGroupChatRoom(conversationId) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave-group-chat', conversationId);
  }

  // Send group typing indicator
  sendGroupTyping(conversationId, isTyping = true) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('group-typing', { conversationId, isTyping });
  }

  // Mark group messages as read
  markGroupMessagesAsRead(conversationId, messageIds) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('mark-group-messages-read', { conversationId, messageIds });
  }

  // Event listeners
  onMessage(listener) {
    this.messageListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onConnection(listener) {
    this.connectionListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  onNotification(listener) {
    this.notificationListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  onGroupMessage(listener) {
    this.groupMessageListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.groupMessageListeners.delete(listener);
    };
  }

  onGroupTyping(listener) {
    this.groupTypingListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.groupTypingListeners.delete(listener);
    };
  }

  // Show browser notification
  showNotification(messageData) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(`New message from ${messageData.senderName}`, {
        body: messageData.content.substring(0, 100),
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `message-${messageData.id}`,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Notify listeners about notification click
        this.notificationListeners.forEach(listener => {
          try {
            listener({ type: 'click', messageData });
          } catch (error) {
          }
        });
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Request notification permission (instance method)
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Get connection status
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Reconnect manually
  reconnect() {
    this.disconnect();
    return this.connect();
  }
  
  // Test WebSocket connection manually (for debugging)
  testConnection() {
    console.log('SocketService: Testing WebSocket connection...');
    console.log('SocketService: Socket exists?', !!this.socket);
    console.log('SocketService: Socket connected?', this.socket?.connected);
    console.log('SocketService: Socket ID:', this.socket?.id);
    console.log('SocketService: Is connected flag:', this.isConnected);
    console.log('SocketService: Connected users:', this.connectedUsers.size);
    console.log('SocketService: Message listeners:', this.messageListeners.size);
    console.log('SocketService: Group message listeners:', this.groupMessageListeners.size);
    
    if (this.socket?.connected) {
      console.log('SocketService: Emitting test ping...');
      this.socket.emit('ping-activity');
    } else {
      console.warn('SocketService: Cannot test - socket not connected');
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect when user is authenticated
if (authService.isAuthenticated()) {
  socketService.connect().catch(error => {
    console.error('SocketService: Auto-connection failed:', error);
  });
}

// Make socketService available globally for debugging
if (typeof window !== 'undefined') {
  window.socketService = socketService;
}

export default socketService;
