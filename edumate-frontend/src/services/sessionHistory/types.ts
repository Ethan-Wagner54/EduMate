// Session History Types
export interface SessionHistoryItem {
  id: number;
  module: {
    name: string;
    code: string;
  };
  tutor: {
    id: number;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'completed' | 'cancelled' | 'scheduled' | 'in-progress';
  rating: number | null;
  feedback: string | null;
  attendance: 'present' | 'absent';
}

// Tutor Session Types
export interface TutorSession {
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
  capacity?: number;
  enrolled: number;
  status: string;
  description?: string;
}

export interface Tutor {
  id: number;
  name: string;
  email: string;
  modules: string[];
  rating: number;
  totalSessions: number;
  completedSessions: number;
  specialties: string[];
}

export interface TutorSessionsData {
  tutor: Tutor;
  sessions: TutorSession[];
}

// Query Parameters
export interface SessionHistoryQueryParams {
  status?: 'all' | 'completed' | 'cancelled';
  sortBy?: 'date' | 'rating' | 'module';
}

// Request Types
export interface SessionReviewRequest {
  rating: number;
  feedback?: string;
}

// Response Types
export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface SessionHistoryResponse extends BaseResponse {
  data?: SessionHistoryItem[];
}

export interface SessionReviewResponse extends BaseResponse {
  data?: any;
}

export interface TutorSessionsResponse extends BaseResponse {
  data?: TutorSessionsData;
}