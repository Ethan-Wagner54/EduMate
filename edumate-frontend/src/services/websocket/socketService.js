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
      return Promise.resolve();
    }

    const token = authService.getToken();
    if (!token) {
      console.warn('No auth token found, cannot connect to socket');
      return Promise.reject('No authentication token');
    }

    // Socket.io connection with auth
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
        console.log('Socket connected:', this.socket.id);
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
            console.error('Error in connection listener:', error);
          }
        });

        resolve();
      });

      // Connection failed
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          
          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          reject(error);
        }
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        
        // Notify listeners
        this.connectionListeners.forEach(listener => {
          try {
            listener({ connected: false, reason });
          } catch (error) {
            console.error('Error in disconnection listener:', error);
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
        console.log('New message received:', messageData);
        this.messageListeners.forEach(listener => {
          try {
            listener(messageData);
          } catch (error) {
            console.error('Error in message listener:', error);
          }
        });

        // Show notification if page is not visible
        if (document.hidden && 'Notification' in window) {
          this.showNotification(messageData);
        }
      });

      // Listen for message status updates
      this.socket.on('message-status', (statusData) => {
        console.log('Message status update:', statusData);
        // You can add status listeners here if needed
      });

      // Listen for typing indicators
      this.socket.on('user-typing', (typingData) => {
        console.log('User typing:', typingData);
        // Handle typing indicators
      });

      // Listen for group messages
      this.socket.on('new-group-message', (messageData) => {
        console.log('New group message received:', messageData);
        this.groupMessageListeners.forEach(listener => {
          try {
            listener(messageData);
          } catch (error) {
            console.error('Error in group message listener:', error);
          }
        });

        // Show notification if page is not visible
        if (document.hidden && 'Notification' in window) {
          this.showNotification(messageData);
        }
      });

      // Listen for group typing indicators
      this.socket.on('group-user-typing', (typingData) => {
        console.log('Group user typing:', typingData);
        this.groupTypingListeners.forEach(listener => {
          try {
            listener(typingData);
          } catch (error) {
            console.error('Error in group typing listener:', error);
          }
        });
      });

      // Authentication error
      this.socket.on('auth-error', (error) => {
        console.error('Socket authentication error:', error);
        this.disconnect();
        reject(error);
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

    this.socket.emit('join-group-chat-room', conversationId);
  }

  // Leave a group chat room
  leaveGroupChatRoom(conversationId) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave-group-chat-room', conversationId);
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
            console.error('Error in notification listener:', error);
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
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect when user is authenticated
if (authService.isAuthenticated()) {
  socketService.connect().catch(error => {
    console.warn('Failed to auto-connect socket:', error);
  });
}

export default socketService;