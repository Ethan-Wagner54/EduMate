// src/components/DashboardContent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertTriangle, Star, MessageSquare, Loader } from "lucide-react";
import dashboardService from '../services/dashboard/dashboard';
import groupChatService from '../services/groupChat/groupChatService';
import authService from '../services/auth/auth';

export default function DashboardContent() {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [tutorProgress, setTutorProgress] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinChatLoading, setJoinChatLoading] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data concurrently
        const [statsResponse, upcomingResponse, progressResponse, activitiesResponse] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getUpcomingSessions(),
          dashboardService.getTutorProgress(),
          dashboardService.getRecentActivities()
        ]);

        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        } else {
        }

        if (upcomingResponse.success) {
          setUpcomingSessions(upcomingResponse.data || []);
        } else {
        }

        if (progressResponse.success) {
          setTutorProgress(progressResponse.data || []);
        } else {
        }

        if (activitiesResponse.success) {
          setActivities(activitiesResponse.data || []);
        } else {
        }

      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation handlers
  const handleActiveTutorsClick = () => {
    navigate('/student/my-tutors');
  };

  const handleSessionsThisMonthClick = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    navigate(`/student/session-history?month=${year}-${month.toString().padStart(2, '0')}`);
  };

  const handleUpcomingSessionsClick = () => {
    navigate('/student/my-sessions?filter=upcoming');
  };

  const handleJoinSessionChat = async (sessionId) => {
    try {
      setJoinChatLoading(prev => ({ ...prev, [sessionId]: true }));
      
      // Get or create the session group chat
      const groupChatResponse = await groupChatService.getGroupChatBySession(sessionId);
      
      if (groupChatResponse.success && groupChatResponse.data) {
        // Navigate to messages with the conversation ID
        const userRole = authService.getUserRole();
        const messagesPath = userRole === 'tutor' ? '/tutor/messages' : '/student/messages';
        navigate(`${messagesPath}?conversation=${groupChatResponse.data.id}`);
      } else {
        // If group chat doesn't exist, user might not be enrolled or session hasn't started
        alert('Unable to join session chat. Make sure you are enrolled in this session.');
      }
    } catch (error) {
      alert('Failed to join session chat.');
    } finally {
      setJoinChatLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <main className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{dashboardStats?.user?.firstName || 'Student'}!</span>
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your tutoring sessions today.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={handleActiveTutorsClick}
          className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors duration-200 cursor-pointer hover:bg-accent/50"
        >
          <div>
            <h2 className="text-sm text-muted-foreground font-medium">Active Tutors</h2>
            <p className="text-3xl font-bold mt-1 text-foreground">{dashboardStats?.activeTutors || 0}</p>
            <p className="text-xs text-muted-foreground">Click to view your tutors</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <Users size={20} className="text-green-500"/>
          </div>
        </div>
        <div 
          onClick={handleSessionsThisMonthClick}
          className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors duration-200 cursor-pointer hover:bg-accent/50"
        >
          <div>
            <h2 className="text-sm text-muted-foreground font-medium">Sessions This Month</h2>
            <p className="text-3xl font-bold mt-1 text-foreground">{dashboardStats?.sessionsThisMonth || 0}</p>
            <p className="text-xs text-muted-foreground">Click to view session history</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <Calendar size={20} className="text-blue-500"/>
          </div>
        </div>
        <div 
          onClick={handleUpcomingSessionsClick}
          className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors duration-200 cursor-pointer hover:bg-accent/50"
        >
          <div>
            <h2 className="text-sm text-muted-foreground font-medium">Upcoming Sessions</h2>
            <p className="text-3xl font-bold mt-1 text-foreground">{dashboardStats?.upcomingSessions || 0}</p>
            <p className="text-xs text-muted-foreground">Click to view upcoming sessions</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
              <AlertTriangle size={20} className="text-purple-500"/>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors duration-200">
          <div>
            <h2 className="text-sm text-muted-foreground font-medium">Avg. Session Rating</h2>
            <p className="text-3xl font-bold mt-1 text-foreground">{dashboardStats?.averageRating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
              <Star size={20} className="text-yellow-500"/>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Sessions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
            <button 
              onClick={handleUpcomingSessionsClick}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All Sessions
            </button>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming sessions scheduled</p>
          ) : (
            upcomingSessions.slice(0, 3).map((session) => {
              const tutorInitials = session.tutor.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('');
              
              return (
                <div key={session.id} className="border border-border rounded-xl p-4 mb-4 last:mb-0 flex items-center justify-between">
                  <div className="flex items-start">
                    {/* Tutor Avatar */}
                    <div className="mr-4 flex-shrink-0">
                      {/* Reusable avatar component will show tutor's profile picture if available */}
                      {/* Fallback to initials if no picture */}
                      <span className="inline-block rounded-full overflow-hidden">
                        {/* Lightweight inline to avoid import churn here; in larger refactor we can import AvatarSmall */}
                        <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-primary-foreground text-lg">
                          {tutorInitials}
                        </div>
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.module.name}</p>
                      <p className="text-sm text-muted-foreground">with {session.tutor.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Calendar size={12} className="mr-1"/>
                        <span className="mr-2 font-medium">{formatTime(session.startTime)}</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">{session.module.code}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleJoinSessionChat(session.id)}
                    disabled={joinChatLoading[session.id]}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {joinChatLoading[session.id] ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Join Chat
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Progress with Tutors */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Progress with Tutors</h2>
            <button 
              onClick={handleActiveTutorsClick}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All Tutors
            </button>
          </div>
          {tutorProgress.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tutor progress data available</p>
          ) : (
            tutorProgress.map((tutor, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-medium text-foreground">{tutor.name}</span>
                    <span className="text-muted-foreground text-xs">· {tutor.sessions} sessions</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <span>{tutor.rating?.toFixed(1) || '0.0'}</span>
                    <Star size={14} className="ml-1 text-yellow-400 fill-current"/>
                  </div>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-colors duration-200"
                    style={{ width: `${tutor.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-colors duration-200">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent activities</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {activities.slice(0, 5).map((activity) => {
              const getActivityColor = (type) => {
                switch (type) {
                  case 'session_completed': return 'bg-green-500';
                  case 'session_enrolled': return 'bg-blue-500';
                  case 'session_attended': return 'bg-emerald-500';
                  case 'session_cancelled': return 'bg-red-500';
                  case 'message_sent': return 'bg-purple-500';
                  case 'session_reviewed': return 'bg-yellow-500';
                  default: return 'bg-gray-500';
                }
              };
              
              const getActivityIcon = (type) => {
                switch (type) {
                  case 'session_completed': return '✓';
                  case 'session_enrolled': return '+';
                  case 'session_attended': return '👥';
                  case 'session_cancelled': return '✕';
                  case 'message_sent': return '💬';
                  case 'session_reviewed': return '⭐';
                  default: return '•';
                }
              };

              return (
                <li key={activity.id} className="flex justify-between items-center hover:bg-accent/20 rounded-lg p-2 -m-2 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 ${getActivityColor(activity.type)} rounded-full mr-3 flex items-center justify-center text-white text-xs font-bold`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <span className="text-foreground">{activity.description}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{formatTimeAgo(activity.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}