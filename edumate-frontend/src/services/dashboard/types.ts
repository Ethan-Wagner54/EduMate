// Dashboard Statistics Types
export interface DashboardStats {
  activeTutors: number;
  sessionsThisMonth: number;
  upcomingSessions: number;
  averageRating: number;
  totalSessions: number;
  completedSessions: number;
}

// Activity Types
export interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  entityType?: string;
  entityId?: number;
  metadata?: any;
}

// Upcoming Session Types
export interface UpcomingSession {
  id: number;
  startTime: string;
  endTime: string;
  location?: string;
  capacity?: number;
  module: {
    code: string;
    name: string;
  };
  tutor: {
    id: number;
    name: string;
  };
}

// Tutor Progress Types
export interface TutorProgress {
  name: string;
  subject: string;
  sessions: number;
  rating: number;
  progress: number;
  initials: string;
}

// Response Types
export interface DashboardResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ActivitiesResponse = DashboardResponse<Activity[]>;
export type UpcomingSessionsResponse = DashboardResponse<UpcomingSession[]>;
export type TutorProgressResponse = DashboardResponse<TutorProgress[]>;