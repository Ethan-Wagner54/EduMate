// Types for group chat functionality linked to sessions

export interface GroupChatParticipant {
  id: number;
  userId: number;
  userName: string;
  userRole: 'student' | 'tutor' | 'admin';
  avatar?: string;
  joinedAt: string;
  lastRead?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface GroupChatMessage {
  id: number | string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: 'student' | 'tutor' | 'admin';
  content: string;
  messageType?: 'text' | 'file' | 'image' | 'system';
  attachments?: MessageAttachment[];
  sentAt: string;
  editedAt?: string;
  isRead: boolean;
  isOwn: boolean;
  sending?: boolean;
}

export interface MessageAttachment {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface GroupChat {
  id: number;
  name?: string;
  type: 'session_chat' | 'group' | 'direct';
  sessionId?: number;
  session?: {
    id: number;
    module: {
      code: string;
      name: string;
    };
    tutor: {
      id: number;
      name: string;
    };
    startTime: string;
    endTime: string;
    location?: string;
  };
  participants: GroupChatParticipant[];
  lastMessage?: {
    content: string;
    senderName: string;
    sentAt: string;
  };
  totalMessages: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupChatResponse {
  success: boolean;
  data?: GroupChat;
  error?: string;
}

export interface GroupChatListResponse {
  success: boolean;
  data?: {
    conversations: GroupChat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

export interface GroupChatMessagesResponse {
  success: boolean;
  data?: {
    messages: GroupChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

export interface SendGroupMessageRequest {
  conversationId: number;
  content: string;
  messageType?: 'text' | 'file' | 'image';
  attachments?: MessageAttachment[];
}

export interface SendGroupMessageResponse {
  success: boolean;
  data?: GroupChatMessage;
  error?: string;
}

export interface CreateGroupChatRequest {
  sessionId: number;
  name?: string;
  participants?: number[]; // Additional participants beyond session enrollees
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}