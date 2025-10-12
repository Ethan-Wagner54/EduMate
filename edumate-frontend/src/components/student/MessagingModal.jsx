import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, Search, MoreVertical, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth/auth';
import conversationsService from '../../services/conversations/conversations';
import socketService from '../../services/websocket/socketService';
import FileAttachment, { MessageAttachment } from './FileAttachment';
import EmojiPicker from './EmojiPicker';
import MessageSearch from './MessageSearch';

export default function MessagingModal({ tutor, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasRequestedNotifications, setHasRequestedNotifications] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = authService.getUserId();
  const chatRoomId = `chat-${Math.min(currentUserId, tutor?.id || 0)}-${Math.max(currentUserId, tutor?.id || 0)}`;

  // Load messages and setup connections
  useEffect(() => {
    if (isOpen && tutor) {
      loadConversation();
      setupSocketConnection();
      requestNotificationPermission();
      
      // Join chat room
      if (socketService.isSocketConnected()) {
        socketService.joinChatRoom(chatRoomId);
      }
    }

    return () => {
      if (tutor) {
        // Leave chat room
        socketService.leaveChatRoom(chatRoomId);
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };
  }, [isOpen, tutor, chatRoomId]);

  // Load or create conversation, then load messages
  const loadConversation = async () => {
    if (!tutor) return;
    
    setLoading(true);
    try {
      // Ensure a direct conversation exists and get its id
      const convRes = await conversationsService.createOrGetConversation(tutor.id);
      if (convRes.success && convRes.data) {
        const convId = convRes.data.id;
        setConversationId(convId);
        const msgsRes = await conversationsService.getMessages(convId);
        if (msgsRes.success && msgsRes.data) {
          const formattedMessages = msgsRes.data.map(msg => ({
            id: msg.id,
            senderId: msg.isOwn ? currentUserId : tutor.id,
            senderName: msg.sender,
            content: msg.content,
            messageType: 'text',
            timestamp: msg.timestamp,
            isRead: msg.isOwn,
            isOwn: msg.isOwn,
            attachments: []
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      toast.error('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  // Setup socket connection and listeners
  const setupSocketConnection = () => {
    // Connection status listener
    const unsubscribeConnection = socketService.onConnection((status) => {
      setIsConnected(status.connected);
      
      if (status.connected && tutor) {
        socketService.joinChatRoom(chatRoomId);
      }
    });

    // New message listener
    const unsubscribeMessage = socketService.onMessage((messageData) => {
      if (messageData.senderId === tutor?.id) {
        const newMessage = {
          ...messageData,
          isOwn: false
        };
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Show notification if modal is not focused
        if (!document.hasFocus() || document.hidden) {
          toast.info(`New message from ${messageData.senderName}`);
        }
      }
    });

    // Cleanup listeners when component unmounts
    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
    };
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!hasRequestedNotifications) {
      const granted = await socketService.requestNotificationPermission();
      setHasRequestedNotifications(true);
      
      if (granted) {
        toast.success('Notifications enabled! You\'ll be notified of new messages.');
      }
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const messageContent = newMessage.trim();
    if (!messageContent && attachments.length === 0) return;
    if (!tutor || sending) return;

    setSending(true);
    
    try {
      const messageData = {
        recipientId: tutor.id,
        content: messageContent,
        type: 'text',
        attachments: attachments
      };

      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: 'You',
        content: messageContent,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        isOwn: true,
        attachments: attachments,
        sending: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setAttachments([]);
      
      // Prefer socket if connected; otherwise fallback to HTTP conversations API
      let delivered = null;
      if (socketService.isSocketConnected()) {
        try {
          const socketResp = await socketService.sendMessage({ recipientId: tutor.id, content: messageContent });
          delivered = {
            id: socketResp.id,
            senderId: currentUserId,
            senderName: 'You',
            content: socketResp.content,
            messageType: 'text',
            timestamp: socketResp.timestamp,
            isOwn: true,
            isRead: false,
            attachments: attachments
          };
        } catch (socketErr) {
        }
      }

      if (!delivered) {
        // Ensure we have a conversation id
        let convId = conversationId;
        if (!convId) {
          const convRes = await conversationsService.createOrGetConversation(tutor.id);
          if (!convRes.success || !convRes.data) throw new Error('Unable to create conversation');
          convId = convRes.data.id;
          setConversationId(convId);
        }
        const httpResp = await conversationsService.sendMessage(convId, messageContent);
        if (!httpResp.success || !httpResp.data) {
          throw new Error(httpResp.error || 'Failed to send');
        }
        const msg = httpResp.data;
        delivered = {
          id: msg.id,
          senderId: currentUserId,
          senderName: 'You',
          content: msg.content,
          messageType: 'text',
          timestamp: msg.timestamp,
          isOwn: true,
          isRead: true,
          attachments: []
        };
      }

      // Replace optimistic with delivered
      const finalDelivered = delivered;
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? { ...finalDelivered, sending: false } : m));
      
    } catch (error) {
      toast.error('Failed to send message');
      
      // Remove failed message
      setMessages(prev => prev.filter(msg => String(msg.id).startsWith('temp-') === false));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicators
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (socketService.isSocketConnected()) {
      socketService.sendTyping(chatRoomId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(chatRoomId, false);
      }, 2000);
    }
    // Still allow typing while offline; typing indicators are best-effort
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setNewMessage(prev => prev + emoji);
    }
  };

  // Handle attachments
  const handleAttachmentSelect = (attachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleAttachmentRemove = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatTime = (timestamp) => {
    // If server sent a preformatted string, just return it
    if (typeof timestamp === 'string' && isNaN(Date.parse(timestamp))) {
      return timestamp;
    }
    const now = new Date();
    const messageTime = new Date(timestamp);
    if (isNaN(messageTime.getTime())) return '';
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-[#6A0DAD] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-3">
              {tutor?.name?.split(' ').map(word => word.charAt(0)).join('') || 'T'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{tutor?.name}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>{tutor?.modules?.join(', ') || 'Tutor'}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  {isConnected ? (
                    <><Wifi size={14} className="text-green-500 mr-1" />Online</>
                  ) : (
                    <><WifiOff size={14} className="text-gray-400 mr-1" />Reconnecting...</>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Search messages"
            >
              <Search size={18} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-gray-400" size={24} />
              <span className="ml-2 text-gray-500">Loading messages...</span>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl relative ${
                      message.isOwn
                        ? 'bg-[#6A0DAD] text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    } ${message.sending ? 'opacity-70' : ''}`}
                  >
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={`space-y-2 ${message.content ? 'mt-2' : ''}`}>
                        {message.attachments.map((attachment, index) => (
                          <MessageAttachment key={index} attachment={attachment} />
                        ))}
                      </div>
                    )}
                    
                    {/* Sending indicator */}
                    {message.sending && (
                      <div className="absolute -bottom-1 -right-1">
                        <Loader2 size={12} className="animate-spin text-current" />
                      </div>
                    )}
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                    {message.isOwn && (
                      <span className="ml-2">
                        {message.sending ? 'Sending...' : message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
                {!message.isOwn && (
                  <div className="w-8 h-8 bg-[#6A0DAD] rounded-full flex items-center justify-center font-bold text-white text-xs mr-2 mt-auto order-0">
                    {tutor?.name?.split(' ').map(word => word.charAt(0)).join('') || 'T'}
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2 text-xs text-gray-500">typing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200">
          {/* File Upload Area */}
          {showFileUpload && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <FileAttachment 
                attachments={attachments}
                onAttachmentSelect={handleAttachmentSelect}
                onAttachmentRemove={handleAttachmentRemove}
              />
            </div>
          )}
          
          {/* Attachment Preview */}
          {attachments.length > 0 && !showFileUpload && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Paperclip size={14} />
                <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="text-purple-600 hover:text-purple-800 ml-auto"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.slice(0, 3).map((attachment, index) => (
                  <div key={attachment.id} className="text-xs bg-white px-2 py-1 rounded border">
                    {attachment.originalName || attachment.name}
                  </div>
                ))}
                {attachments.length > 3 && (
                  <div className="text-xs text-gray-500 px-2 py-1">
                    +{attachments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32"
                  rows="1"
                  style={{ minHeight: '44px' }}
                  disabled={sending}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      showFileUpload
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title="Attach files"
                  >
                    <Paperclip size={16} />
                  </button>
                  <EmojiPicker 
                    onEmojiSelect={handleEmojiSelect}
                    disabled={sending || !isConnected}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                className="bg-[#6A0DAD] text-white rounded-full p-3 hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                title={!isConnected ? 'Reconnecting...' : 'Send message'}
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
            
            {!isConnected && (
              <div className="flex items-center justify-center mt-2 text-xs text-amber-600">
                <AlertCircle size={12} className="mr-1" />
                Connection lost. Trying to reconnect...
              </div>
            )}
          </div>
        </div>
        
        {/* Search Modal */}
        <MessageSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          tutorId={tutor?.id}
          tutorName={tutor?.name}
        />
      </div>
    </div>
  );
}
