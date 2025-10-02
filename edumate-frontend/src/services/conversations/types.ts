// Conversation Types
export interface Conversation {
  id: number | string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  userType: 'teacher' | 'admin' | 'student';
}

// Message Types
export interface Message {
  id: number | string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

// Request/Response Types
export interface SendMessageRequest {
  content: string;
}

export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface ConversationsResponse extends BaseResponse {
  data?: Conversation[];
}

export interface ConversationResponse extends BaseResponse {
  data?: Conversation;
}

export interface MessagesResponse extends BaseResponse {
  data?: Message[];
}

export interface SendMessageResponse extends BaseResponse {
  data?: Message;
}