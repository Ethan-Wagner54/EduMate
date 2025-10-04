import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Send, Paperclip, Search, MoreVertical, Wifi, WifiOff, 
  Loader2, AlertCircle, Users, Crown, Settings, UserPlus 
} from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth/auth';
import groupChatService from '../../services/groupChat/groupChatService';
import socketService from '../../services/websocket/socketService';
import { AvatarSmall } from '../ui/Avatar';
import FileAttachment from '../student/FileAttachment';
import EmojiPicker from '../student/EmojiPicker';
// TypeScript types removed for .jsx compatibility

export default function GroupChatModal({ groupChat, isOpen, onClose, onGroupChatUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = authService.getUserId();
  const conversationId = groupChat?.id;

  // Load messages and setup connections
  useEffect(() => {
    if (isOpen && groupChat) {
      loadGroupChatMessages();
      setupSocketConnection();
      
      // Join group chat room
      if (conversationId && socketService.isSocketConnected()) {
        groupChatService.joinGroupChatRoom(conversationId);
      }
    }

    return () => {
      if (conversationId) {
        // Leave group chat room
        groupChatService.leaveGroupChatRoom(conversationId);
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };
  }, [isOpen, groupChat, conversationId]);

  // Load messages from API
  const loadGroupChatMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const response = await groupChatService.getGroupChatMessages(conversationId);
      if (response.success && response.data.messages) {
        const formattedMessages = response.data.messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === currentUserId
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading group chat messages:', error);
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
      
      if (status.connected && conversationId) {
        groupChatService.joinGroupChatRoom(conversationId);
      }
    });

    // New group message listener
    const unsubscribeGroupMessage = socketService.onGroupMessage((messageData) => {
      if (messageData.conversationId === conversationId && messageData.senderId !== currentUserId) {
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
          toast.info(`New message from ${messageData.senderName} in ${groupChat?.name}`);
        }
      }
    });

    // Typing indicator listener
    const unsubscribeTyping = socketService.onGroupTyping((typingData) => {
      if (typingData.conversationId === conversationId && typingData.userId !== currentUserId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== typingData.userId);
          return typingData.isTyping 
            ? [...filtered, typingData]
            : filtered;
        });
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeGroupMessage();
      unsubscribeTyping();
    };
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
    if (!conversationId || sending) return;

    setSending(true);
    
    try {
      const messageData = {
        conversationId,
        content: messageContent,
        messageType: 'text',
        attachments: attachments
      };

      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        senderName: 'You',
        senderRole: authService.getUserRole(),
        content: messageContent,
        messageType: 'text',
        sentAt: new Date().toISOString(),
        isRead: false,
        isOwn: true,
        attachments: attachments,
        sending: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setAttachments([]);
      
      // Send via service
      const response = await groupChatService.sendGroupMessage(messageData);
      
      if (response.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...response.data, isOwn: true, sending: false }
            : msg
        ));
        
        // Update group chat in parent component
        if (onGroupChatUpdate) {
          onGroupChatUpdate({
            ...groupChat,
            lastMessage: {
              content: messageContent,
              senderName: 'You',
              sentAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Remove failed message and show error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        toast.error(response.error || 'Failed to send message');
        
        // Restore message content
        setNewMessage(messageContent);
        setAttachments(messageData.attachments);
      }
      
    } catch (error) {
      console.error('Error sending group message:', error);
      toast.error('Failed to send message');
      
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicators
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (socketService.isSocketConnected() && conversationId) {
      socketService.sendGroupTyping(conversationId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendGroupTyping(conversationId, false);
      }, 2000);
    }
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
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
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

  const getParticipantsByRole = () => {
    if (!groupChat?.participants) return { tutors: [], students: [] };
    
    return {
      tutors: groupChat.participants.filter(p => p.userRole === 'tutor'),
      students: groupChat.participants.filter(p => p.userRole === 'student')
    };
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'tutor':
        return <Crown size={12} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const { tutors, students } = getParticipantsByRole();
  const totalParticipants = groupChat?.participants?.length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[700px] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center flex-1">
            <div className="bg-[#6A0DAD] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-3">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">{groupChat?.name}</h3>
                {groupChat?.session && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {groupChat.session.module.code}
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users size={14} className="mr-1" />
                <span>{totalParticipants} participants</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  {isConnected ? (
                    <><Wifi size={14} className="text-green-500 mr-1" />Connected</>
                  ) : (
                    <><WifiOff size={14} className="text-gray-400 mr-1" />Reconnecting...</>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Show participants"
            >
              <Users size={18} className="text-gray-500" />
            </button>
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Search messages"
            >
              <Search size={18} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={18} className="text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
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
                    {!message.isOwn && (
                      <AvatarSmall
                        userId={message.senderId}
                        userName={message.senderName}
                        userType={message.senderRole}
                        size={32}
                        className="mr-3 mt-1"
                      />
                    )}
                    <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                      {!message.isOwn && (
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{message.senderName}</span>
                          {getRoleIcon(message.senderRole)}
                        </div>
                      )}
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
                              <div key={index} className="text-xs bg-black/10 px-2 py-1 rounded">
                                {attachment.originalName || attachment.name}
                              </div>
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
                        {formatTime(message.sentAt)}
                        {message.isOwn && (
                          <span className="ml-2">
                            {message.sending ? 'Sending...' : '✓'}
                          </span>
                        )}
                      </p>
                    </div>
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
                    <span className="ml-2 text-xs text-gray-500">
                      {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
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
                      placeholder="Type a message to the group..."
                      className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32"
                      rows="1"
                      style={{ minHeight: '44px' }}
                      disabled={sending || !isConnected}
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
                    disabled={(!newMessage.trim() && attachments.length === 0) || sending || !isConnected}
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
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Participants ({totalParticipants})</h4>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Tutors */}
                {tutors.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                      <Crown size={14} className="text-yellow-500 mr-2" />
                      Tutors ({tutors.length})
                    </h5>
                    <div className="space-y-2">
                      {tutors.map((participant) => (
                        <div key={participant.id} className="flex items-center p-2 rounded-lg bg-white">
                          <AvatarSmall
                            userId={participant.userId}
                            userName={participant.userName}
                            userType="tutor"
                            size={32}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-sm text-gray-800">{participant.userName}</span>
                              {participant.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Students */}
                {students.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                      <Users size={14} className="mr-2" />
                      Students ({students.length})
                    </h5>
                    <div className="space-y-2">
                      {students.map((participant) => (
                        <div key={participant.id} className="flex items-center p-2 rounded-lg bg-white">
                          <AvatarSmall
                            userId={participant.userId}
                            userName={participant.userName}
                            userType="student"
                            size={32}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-sm text-gray-800">{participant.userName}</span>
                              {participant.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}