import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  MessageSquare, 
  Users, 
  Crown,
  Calendar,
  MapPin,
  Clock,
  X,
  ArrowLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  LogOut,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth/auth';
import conversationsService from '../../services/conversations/conversations';
import groupChatService from '../../services/groupChat/groupChatService';
import messageService from '../../services/messages/messageService';
import socketService from '../../services/websocket/socketService';
import fileUploadService from '../../services/fileUpload/fileUploadService';
import userService from '../../services/user/user';
import { AvatarSmall, AvatarMedium } from '../ui/Avatar';

export default function UnifiedMessaging({ 
  type = 'both', // 'private', 'group', 'both'
  initialConversationId = null,
  onClose = null, // For modal mode
  isModal = false,
  title = 'Messages'
}) {
  // State management
  const [conversations, setConversations] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(type === 'both' ? 'private' : type);
  const [currentUser, setCurrentUser] = useState(null);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Connection & UI states
  const [isConnected, setIsConnected] = useState(false);
  const [showMobileConversationList, setShowMobileConversationList] = useState(true);
  const [error, setError] = useState(null);
  
  // Dropdown & modals state
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // User info
  const currentUserId = authService.getUserId();

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const userId = authService.getUserId();
      if (userId) {
        const response = await userService.getUser({ id: userId });
        if (response.success && response.data) {
          setCurrentUser(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchCurrentUser();
    loadData();
    setupSocketConnection();
    
    return () => {
      // Cleanup socket listeners
      if (activeConversation) {
        leaveCurrentRoom();
      }
    };
  }, []);

  // Load conversations and group chats
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = [];
      
      if (type === 'private' || type === 'both') {
        promises.push(loadPrivateConversations());
      }
      
      if (type === 'group' || type === 'both') {
        promises.push(loadGroupChats());
      }
      
      await Promise.all(promises);
      
      // Auto-select initial conversation if provided
      if (initialConversationId) {
        selectConversation(initialConversationId, type === 'group' ? 'group' : 'private');
      }
      
    } catch (error) {
      console.error('Error loading messaging data:', error);
      setError('Failed to load messaging data');
      toast.error('Failed to load messaging data');
    } finally {
      setLoading(false);
    }
  };

  const loadPrivateConversations = async () => {
    try {
      const response = await conversationsService.getConversations();
      if (response.success && response.data) {
        // Filter for direct/private conversations only
        const privateConversations = response.data.filter(conv => 
          conv.type === 'direct' && !conv.isGroup
        );
        
        const formattedConversations = privateConversations.map(conv => ({
          id: conv.id,
          type: 'private',
          name: conv.name,
          participantName: conv.name,
          participantRole: conv.userType || 'student',
          participantId: conv.userId || 0,
          lastMessage: conv.lastMessage ? {
            content: conv.lastMessage,
            timestamp: conv.timestamp,
            isOwn: false
          } : null,
          unreadCount: conv.unreadCount || 0,
          isOnline: conv.isOnline || false
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error loading private conversations:', error);
    }
  };

  const loadGroupChats = async () => {
    try {
      // Use group chat service to get group conversations including session chats
      const response = await groupChatService.getGroupChats();
      if (response.success && response.data) {
        const formattedGroupChats = response.data.conversations.map(chat => ({
          id: chat.id,
          type: chat.type === 'session_chat' ? 'session' : 'group',
          name: chat.name,
          sessionId: chat.sessionId || null,
          session: chat.session || null,
          participants: chat.participants || [],
          lastMessage: chat.lastMessage ? {
            content: chat.lastMessage.content,
            timestamp: chat.lastMessage.sentAt,
            senderName: chat.lastMessage.senderName,
            isOwn: false
          } : null,
          unreadCount: chat.unreadCount || 0,
          totalMessages: chat.totalMessages || 0,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }));
        setGroupChats(formattedGroupChats);
      }
    } catch (error) {
      console.error('Error loading group chats:', error);
      // Fallback to conversations service if group chat service fails
      try {
        const fallbackResponse = await conversationsService.getConversations();
        if (fallbackResponse.success && fallbackResponse.data) {
          const groupConversations = fallbackResponse.data.filter(conv => 
            (conv.type === 'group' || conv.type === 'session_chat') || conv.isGroup
          );
          
          const formattedGroupChats = groupConversations.map(chat => ({
            id: chat.id,
            type: 'group',
            name: chat.name,
            sessionId: null,
            session: null,
            participants: [],
            lastMessage: chat.lastMessage ? {
              content: chat.lastMessage,
              timestamp: chat.timestamp,
              senderName: 'Member',
              isOwn: false
            } : null,
            unreadCount: chat.unreadCount || 0,
            totalMessages: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          setGroupChats(formattedGroupChats);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  // Socket connection setup
  const setupSocketConnection = () => {
    const connectionListener = socketService.onConnection((status) => {
      setIsConnected(status.connected);
    });

    const messageListener = socketService.onMessage((messageData) => {
      console.log('📡 WebSocket message received:', messageData);
      
      if (activeConversation && 
          ((activeConversation.type === 'private' && messageData.senderId !== currentUserId) ||
           (activeConversation.type === 'group' && messageData.conversationId === activeConversation.id))) {
        
        const newMessage = {
          id: messageData.id || Date.now(),
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          timestamp: messageData.timestamp || new Date().toISOString(),
          isOwn: messageData.senderId === currentUserId,
          attachments: messageData.attachments || messageData.files || []
        };
        
        console.log('📨 Formatted WebSocket message:', newMessage);
        
        setMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Show notification if not focused
        if (!document.hasFocus()) {
          toast.info(`New message from ${messageData.senderName}`);
        }
      }
    });

    return () => {
      connectionListener();
      messageListener();
    };
  };

  // Conversation selection
  const selectConversation = async (conversationId, conversationType) => {
    if (activeConversation?.id === conversationId) return;
    
    // Leave current room if any
    leaveCurrentRoom();
    
    // Find the conversation
    const allConversations = [...conversations, ...groupChats];
    const conversation = allConversations.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    setActiveConversation(conversation);
    setShowMobileConversationList(false);
    
    // Join room for real-time updates
    joinConversationRoom(conversation);
    
    // Load messages
    await loadMessages(conversation);
    
    // Mark as read
    markConversationAsRead(conversation);
  };

  const joinConversationRoom = (conversation) => {
    if (socketService.isSocketConnected()) {
      if (conversation.type === 'group') {
        socketService.joinGroupChatRoom(conversation.id);
      } else {
        // For private chats, we might use a different room format
        const chatRoomId = `chat-${Math.min(currentUserId, conversation.participantId)}-${Math.max(currentUserId, conversation.participantId)}`;
        socketService.joinChatRoom(chatRoomId);
      }
    }
  };

  const leaveCurrentRoom = () => {
    if (activeConversation && socketService.isSocketConnected()) {
      if (activeConversation.type === 'group') {
        socketService.leaveGroupChatRoom(activeConversation.id);
      } else {
        const chatRoomId = `chat-${Math.min(currentUserId, activeConversation.participantId)}-${Math.max(currentUserId, activeConversation.participantId)}`;
        socketService.leaveChatRoom(chatRoomId);
      }
    }
  };

  const loadMessages = async (conversation) => {
    setMessagesLoading(true);
    
    try {
      let response;
      
      // Use conversations API for both private and group messages
      response = await conversationsService.getMessages(conversation.id);
      
      if (response.success && response.data) {
        const formattedMessages = response.data.map(msg => {
          console.log('📨 Loading message from DB:', msg);
          return {
            id: msg.id,
            senderId: msg.isOwn ? currentUserId : (conversation.participantId || 0),
            senderName: msg.sender,
            content: msg.content,
            messageType: msg.messageType || 'text',
            timestamp: msg.timestamp,
            isOwn: msg.isOwn,
            attachments: msg.attachments || msg.files || [] // Try both fields
          };
        });
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const markConversationAsRead = (conversation) => {
    if (conversation.unreadCount > 0) {
      // Update local state
      if (conversation.type === 'group') {
        setGroupChats(prev => prev.map(chat => 
          chat.id === conversation.id ? { ...chat, unreadCount: 0 } : chat
        ));
      } else {
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        ));
      }
    }
  };

  // Message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const messageContent = newMessage.trim();
    if (!messageContent || !activeConversation || sending) return;
    
    setSending(true);
    
    try {
      // Optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: 'You',
        content: messageContent,
        messageType: 'text',
        timestamp: new Date().toISOString(),
        isOwn: true,
        sending: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      let response;
      
      // Use conversations API for both private and group messages
      response = await conversationsService.sendMessage(activeConversation.id, messageContent);
      
      if (response.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...tempMessage,
                id: response.data.id,
                timestamp: response.data.timestamp,
                sending: false
              }
            : msg
        ));
        
        // Update conversation list
        updateConversationLastMessage(activeConversation, messageContent, new Date().toISOString());
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore message content
    } finally {
      setSending(false);
    }
  };

  const updateConversationLastMessage = (conversation, content, timestamp) => {
    const lastMessage = {
      content,
      timestamp,
      isOwn: true
    };
    
    if (conversation.type === 'group') {
      setGroupChats(prev => prev.map(chat => 
        chat.id === conversation.id 
          ? { ...chat, lastMessage, updatedAt: timestamp }
          : chat
      ));
    } else {
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, lastMessage }
          : conv
      ));
    }
  };

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (!fileUploadService.isValidFileType(file)) {
        toast.error(`File type not supported: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    event.target.value = ''; // Reset input
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendWithAttachments = async () => {
    if (!activeConversation || (!newMessage.trim() && selectedFiles.length === 0)) {
      return;
    }

    setUploading(true);
    setSending(true);

    try {
      let attachments = [];
      
      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        const uploadResponse = await fileUploadService.uploadFiles(selectedFiles, activeConversation.id);
        if (uploadResponse.success && uploadResponse.data) {
          attachments = uploadResponse.data.attachments;
        } else {
          throw new Error(uploadResponse.error || 'Upload failed');
        }
      }

      // Send message with attachments
      if (attachments.length > 0) {
        const response = await fileUploadService.sendMessageWithAttachments(
          activeConversation.id,
          newMessage.trim(),
          attachments
        );
        
        if (response.success) {
          // Add message to UI
          const newMsg = {
            id: response.data.id,
            senderId: currentUserId,
            senderName: 'You',
            content: response.data.content,
            attachments: attachments,
            timestamp: response.data.timestamp,
            isOwn: true
          };
          setMessages(prev => [...prev, newMsg]);
          
          // Clear inputs
          setNewMessage('');
          setSelectedFiles([]);
          
          // Update conversation list
          const displayContent = newMessage.trim() || `📎 ${attachments.length} file(s)`;
          updateConversationLastMessage(activeConversation, displayContent, new Date().toISOString());
        } else {
          throw new Error(response.error || 'Failed to send message');
        }
      } else {
        // Send regular message
        await handleSendMessage({ preventDefault: () => {} });
      }
      
    } catch (error) {
      console.error('Error sending message with attachments:', error);
      toast.error('Failed to send message with attachments');
    } finally {
      setUploading(false);
      setSending(false);
    }
  };

  // Chat management functions
  const handleDeleteChat = async () => {
    if (!activeConversation) return;
    
    try {
      const response = await groupChatService.deleteGroupChat(activeConversation.id);
      
      if (response.success) {
        toast.success('Chat deleted successfully');
        
        // Remove from local state
        setGroupChats(prev => prev.filter(chat => chat.id !== activeConversation.id));
        setConversations(prev => prev.filter(conv => conv.id !== activeConversation.id));
        
        // Clear active conversation
        setActiveConversation(null);
        setMessages([]);
        setShowMobileConversationList(true);
        
        // Close modals
        setShowDeleteConfirm(false);
        setShowOptionsDropdown(false);
      } else {
        throw new Error(response.error || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat: ' + error.message);
    }
  };
  
  const handleLeaveChat = async () => {
    if (!activeConversation) return;
    
    try {
      const response = await groupChatService.leaveGroupChat(activeConversation.id);
      
      if (response.success) {
        toast.success('Left chat successfully');
        
        // Remove from local state
        setGroupChats(prev => prev.filter(chat => chat.id !== activeConversation.id));
        setConversations(prev => prev.filter(conv => conv.id !== activeConversation.id));
        
        // Clear active conversation
        setActiveConversation(null);
        setMessages([]);
        setShowMobileConversationList(true);
        
        // Close modals
        setShowLeaveConfirm(false);
        setShowOptionsDropdown(false);
      } else {
        throw new Error(response.error || 'Failed to leave chat');
      }
    } catch (error) {
      console.error('Error leaving chat:', error);
      toast.error('Failed to leave chat: ' + error.message);
    }
  };
  
  // Check permissions for chat actions
  const canDeleteChat = () => {
    if (!activeConversation || !currentUser) return false;
    
    // For session chats, only tutor (creator) or admin can delete
    if (activeConversation.type === 'session') {
      return currentUser.role === 'admin' || 
             (currentUser.role === 'tutor' && activeConversation.session?.tutor?.id === currentUser.id);
    }
    
    // For group chats, only creator or admin can delete
    if (activeConversation.type === 'group') {
      const userParticipant = activeConversation.participants?.find(p => p.userId === currentUserId);
      return currentUser.role === 'admin' || 
             (userParticipant && activeConversation.createdBy === currentUserId);
    }
    
    // Direct conversations cannot be deleted, only left
    return false;
  };
  
  const canLeaveChat = () => {
    if (!activeConversation) return false;
    
    // Can leave group chats and session chats
    return activeConversation.type === 'group' || activeConversation.type === 'session';
  };

  // Helper functions
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 60 * 1000) { // Less than 1 hour
      return `${Math.floor(diff / (60 * 1000))}m ago`;
    } else if (diff < 24 * 60 * 60 * 1000) { // Less than 1 day
      return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptionsDropdown(false);
      }
    };

    if (showOptionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptionsDropdown]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupChats = groupChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.session?.module?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.session?.module?.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentList = activeTab === 'private' ? filteredConversations : filteredGroupChats;

  // Loading state
  if (loading) {
    return (
      <div className={`${isModal ? 'h-96' : 'h-screen'} flex items-center justify-center bg-background`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isModal ? 'h-96' : 'h-screen'} bg-background flex`}>
      {/* Conversations Sidebar */}
      <div className={`${showMobileConversationList ? 'flex' : 'hidden'} lg:flex ${isModal ? 'w-80' : 'w-1/3'} border-r border-border flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 mb-3">
            {isConnected ? (
              <Wifi className="text-green-500" size={14} />
            ) : (
              <WifiOff className="text-red-500" size={14} />
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          
          {/* Tabs */}
          {type === 'both' && (
            <div className="flex mb-3 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'private'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Private
              </button>
              <button
                onClick={() => setActiveTab('group')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'group'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Groups
              </button>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'group' ? 'group chats' : 'conversations'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              {activeTab === 'group' ? (
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
              ) : (
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              )}
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No matches found' : `No ${activeTab === 'group' ? 'group chats' : 'conversations'} yet`}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : activeTab === 'group' 
                    ? 'Group chats will appear here when you join sessions'
                    : 'Your conversations will appear here'
                }
              </p>
            </div>
          ) : (
            currentList.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation.id, conversation.type)}
                className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/50 ${
                  activeConversation?.id === conversation.id ? 'bg-accent' : ''
                }`}
              >
                {conversation.type === 'group' || conversation.type === 'session' ? (
                  // Group Chat Item
                  <div className="flex items-start gap-3">
                    {/* Group Avatar with module code or group icon */}
                    {conversation.session ? (
                      // Session chat avatar with module code
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {conversation.session.module.code.split('-')[0]}
                        </span>
                      </div>
                    ) : (
                      // Regular group chat avatar
                      <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <Users size={20} className="text-green-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Show full chat name */}
                        <h3 className="font-semibold text-foreground truncate" title={conversation.name}>
                          {conversation.session ? (
                            // For session chats, show a cleaner format
                            `${conversation.session.module.code} Study Group`
                          ) : (
                            conversation.name
                          )}
                        </h3>
                        {conversation.session && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                            Session
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Show module name as subtitle for session chats */}
                      {conversation.session && (
                        <p className="text-xs text-muted-foreground truncate mb-1" title={conversation.session.module.name}>
                          {conversation.session.module.name}
                        </p>
                      )}
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium">{conversation.lastMessage.senderName}:</span>{' '}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {conversation.participants?.length || 0} participants
                        </span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Private Conversation Item
                  <div className="flex items-center gap-3">
                    <AvatarMedium
                      userId={conversation.participantId}
                      userName={conversation.participantName}
                      userType={conversation.participantRole}
                      size={48}
                      showOnlineStatus={true}
                      isOnline={conversation.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">{conversation.participantName}</h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {conversation.lastMessage.isOwn ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">
                          {conversation.participantRole}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${showMobileConversationList ? 'hidden' : 'flex'} lg:flex flex-1 flex-col`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileConversationList(true)}
                    className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  {activeConversation.type === 'group' || activeConversation.type === 'session' ? (
                    activeConversation.session ? (
                      // Session chat avatar with module code
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {activeConversation.session.module.code.split('-')[0]}
                        </span>
                      </div>
                    ) : (
                      // Regular group chat avatar
                      <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <Users size={24} className="text-green-600" />
                      </div>
                    )
                  ) : (
                    <AvatarMedium
                      userId={activeConversation.participantId}
                      userName={activeConversation.participantName}
                      userType={activeConversation.participantRole}
                      size={48}
                      showOnlineStatus={true}
                      isOnline={activeConversation.isOnline}
                    />
                  )}
                  
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {activeConversation.session ? (
                        `${activeConversation.session.module.code} Study Group`
                      ) : (
                        activeConversation.name
                      )}
                    </h2>
                    {activeConversation.type === 'group' || activeConversation.type === 'session' ? (
                      <div className="text-sm text-muted-foreground">
                        {activeConversation.session && (
                          <span className="block">{activeConversation.session.module.name}</span>
                        )}
                        <span>
                          {activeConversation.participants?.length || 0} participants
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground capitalize">
                        {activeConversation.participantRole}
                        {activeConversation.isOnline && (
                          <span className="ml-2 text-green-500">• Online</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {activeConversation.type === 'private' && (
                    <>
                      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                        <Phone size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                        <Video size={18} className="text-muted-foreground" />
                      </button>
                    </>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MoreVertical size={18} className="text-muted-foreground" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showOptionsDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          {canLeaveChat() && (
                            <button
                              onClick={() => {
                                setShowLeaveConfirm(true);
                                setShowOptionsDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                              <LogOut size={16} />
                              Leave Chat
                            </button>
                          )}
                          {canDeleteChat() && (
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(true);
                                setShowOptionsDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete Chat
                            </button>
                          )}
                          {!canLeaveChat() && !canDeleteChat() && (
                            <div className="px-4 py-2 text-sm text-muted-foreground italic">
                              No actions available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Session Info for Group Chats */}
              {(activeConversation.type === 'group' || activeConversation.type === 'session') && activeConversation.session && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Calendar size={14} className="mr-2" />
                    <span>
                      {new Date(activeConversation.session.startTime).toLocaleDateString()} at{' '}
                      {new Date(activeConversation.session.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  {activeConversation.session.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin size={14} className="mr-2" />
                      <span>{activeConversation.session.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                  <span className="text-muted-foreground">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 mb-4 ${
                    message.isOwn ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.isOwn ? (
                        // For your own messages, show the current logged-in user (Sarah Mitchell)
                        <AvatarMedium
                          userId={currentUser?.id || currentUserId}
                          userName={currentUser?.name || 'You'}
                          userType={currentUser?.role || authService.getUserRole() || 'tutor'}
                          size={32}
                          showOnlineStatus={false}
                        />
                      ) : (
                        // For other people's messages, show their avatar
                        <AvatarMedium
                          userId={message.senderId}
                          userName={message.senderName}
                          userType={message.senderRole}
                          size={32}
                          showOnlineStatus={false}
                        />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                      message.sending ? 'opacity-70' : ''
                    }`}>
                      {/* Message Header */}
                      <div className={`flex items-center gap-2 mb-1 ${
                        message.isOwn ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <span className={`text-sm font-medium ${
                          message.isOwn ? 'text-primary' : 'text-foreground'
                        }`}>
                          {message.isOwn ? 'You' : message.senderName}
                        </span>
                        {message.senderRole === 'tutor' && (
                          <Crown size={12} className="text-yellow-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                          {message.sending && ' • Sending...'}
                        </span>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.isOwn 
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        
                        {/* Display attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className={`space-y-2 ${message.content ? 'mt-3' : ''}`}>
                            {message.attachments.map((attachment, index) => {
                              const isImage = attachment.mimeType?.startsWith('image/');
                              const fileUrl = fileUploadService.getFileUrl(attachment.filename);
                              
                              if (isImage) {
                                console.log('📎 Image attachment:', attachment.originalName, '→', fileUrl);
                              }
                              
                              return (
                                <div key={index}>
                                  {isImage ? (
                                    // Image preview
                                    <div className="rounded-lg overflow-hidden">
                                      <img 
                                        src={fileUrl}
                                        alt={attachment.originalName}
                                        className="max-w-full max-h-64 w-auto h-auto cursor-pointer hover:opacity-90 transition-opacity rounded"
                                        style={{
                                          minWidth: '100px',
                                          minHeight: '60px'
                                        }}
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        onLoad={(e) => {
                                          console.log('✅ Image loaded and should be visible!');
                                          console.log('Image element:', e.target);
                                          console.log('Computed style display:', getComputedStyle(e.target).display);
                                          console.log('Computed style visibility:', getComputedStyle(e.target).visibility);
                                        }}
                                        onError={(e) => {
                                          console.error('❌ Failed to load image:', fileUrl);
                                          // Show fallback
                                          e.target.style.display = 'none';
                                          const fallback = e.target.nextSibling;
                                          if (fallback) fallback.style.display = 'block';
                                        }}
                                      />
                                      {/* Fallback file link (hidden by default) */}
                                      <div 
                                        style={{display: 'none'}} 
                                        className="flex items-center gap-2 p-2 bg-black/20 rounded text-xs mt-2"
                                      >
                                        <span>🖼️</span>
                                        <a 
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 truncate hover:underline"
                                          title={attachment.originalName}
                                        >
                                          {attachment.originalName}
                                        </a>
                                        <span className="text-xs opacity-70">
                                          {fileUploadService.formatFileSize(attachment.size)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    // Non-image file
                                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
                                      <span className="text-lg">{fileUploadService.getFileTypeIcon(attachment.mimeType)}</span>
                                      <div className="flex-1 min-w-0">
                                        <a 
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium hover:underline block truncate"
                                          title={attachment.originalName}
                                        >
                                          {attachment.originalName}
                                        </a>
                                        <span className="text-xs opacity-70">
                                          {fileUploadService.formatFileSize(attachment.size)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Selected Files ({selectedFiles.length})</span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-background rounded text-sm">
                        <span>{fileUploadService.getFileTypeIcon(file.type)}</span>
                        <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {fileUploadService.formatFileSize(file.size)}
                        </span>
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedFiles.length > 0) {
                    handleSendWithAttachments();
                  } else {
                    handleSendMessage(e);
                  }
                }} 
                className="flex items-center space-x-2"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || sending}
                />
                <label
                  htmlFor="file-upload"
                  className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                >
                  <Paperclip size={18} className="text-muted-foreground" />
                </label>
                
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (selectedFiles.length > 0) {
                        handleSendWithAttachments();
                      } else {
                        handleSendMessage(e);
                      }
                    }
                  }}
                  placeholder={selectedFiles.length > 0 ? 'Add a caption...' : 'Type a message...'}
                  disabled={sending || uploading}
                  className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || uploading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select a {type === 'group' ? 'group chat' : 'conversation'}
              </h2>
              <p className="text-muted-foreground">
                Choose a {type === 'group' ? 'group chat' : 'conversation'} from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Delete Chat</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently removed.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <LogOut size={20} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Leave Chat</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to leave this chat? You will no longer receive messages and will need to be re-added to participate again.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveChat}
                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Leave Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
