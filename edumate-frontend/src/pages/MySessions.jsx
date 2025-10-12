import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, XCircle, Loader, Search, ChevronDown, SlidersHorizontal, RefreshCw, MessageSquare } from 'lucide-react';
import sessionService from '../services/sessions/session';
import groupChatService from '../services/groupChat/groupChatService';
import { AvatarSmall } from '../components/ui/Avatar';
import authService from '../services/auth/auth';

export default function MySessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState({});
  const [joinChatLoading, setJoinChatLoading] = useState({});
  const [cancelLoading, setCancelLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [filter, setFilter] = useState('upcoming'); // upcoming as default, all, completed, left, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('any');
  const [availableModules, setAvailableModules] = useState([]);

  // Fetch sessions data
  const fetchMySessions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user's sessions (enrolled sessions for students, created sessions for tutors)
      const response = await sessionService.getUserSessions();
      if (response.success && response.data) {
        setSessions(response.data);
        
        // Extract unique modules for filter dropdown
        const modules = [...new Set((response.data || []).map(session => session.module?.code || session.course))];
        setAvailableModules(modules.filter(Boolean));
      } else {
        setError(response.error || 'Failed to load sessions');
      }
    } catch (error) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySessions();
  }, []);

  // Filter sessions based on search query, module, time, and status
  useEffect(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        (session.title && session.title.toLowerCase().includes(query)) ||
        (session.tutor && session.tutor.toLowerCase().includes(query)) ||
        (session.course && session.course.toLowerCase().includes(query)) ||
        (session.module?.name && session.module.name.toLowerCase().includes(query)) ||
        (session.module?.code && session.module.code.toLowerCase().includes(query)) ||
        (session.description && session.description.toLowerCase().includes(query))
      );
    }

    // Apply module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(session => 
        session.course === moduleFilter || session.module?.code === moduleFilter
      );
    }

    // Apply time filter
    if (timeFilter !== 'any') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.startTime);
        const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        
        switch (timeFilter) {
          case 'today':
            return sessionDay.getTime() === today.getTime();
          case 'tomorrow':
            return sessionDay.getTime() === tomorrow.getTime();
          case 'this_week':
            return sessionDate >= today && sessionDate <= nextWeek;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (filter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(session => {
        const isUpcoming = new Date(session.startTime) > now;
        const isCompleted = new Date(session.endTime) < now;
        
        switch (filter) {
          case 'upcoming':
            return isUpcoming && session.enrollmentStatus !== 'left'; // Exclude left sessions from upcoming
          case 'completed':
            return isCompleted;
          case 'left':
            return session.enrollmentStatus === 'left';
          case 'cancelled':
            return session.status === 'cancelled'; // Session was cancelled by tutor
          default:
            return true;
        }
      });
    }

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, moduleFilter, timeFilter, filter]);

  const handleJoinSessionChat = async (sessionId) => {
    try {
      setJoinChatLoading(prev => ({ ...prev, [sessionId]: true }));
      setError('');
      setSuccess('');

      // First, try to get or create the session group chat
      const groupChatResponse = await groupChatService.getGroupChatBySession(sessionId);
      
      if (groupChatResponse.success && groupChatResponse.data) {
        // Successfully got/created group chat - navigate to messaging
        setSuccess('Successfully joined session chat!');
        
        // Navigate to messages page with the conversation ID
        const userRole = authService.getUserRole();
        const messagesPath = userRole === 'tutor' ? '/tutor/messages' : '/student/messages';
        
        // Add conversation ID as a query parameter so the Messages component can auto-select it
        navigate(`${messagesPath}?conversation=${groupChatResponse.data.id}`);
        
        return; // Don't clear success message since we're navigating away
      } else {
        setError(groupChatResponse.error || 'Failed to join session chat');
      }
    } catch (error) {
      setError('Failed to join session chat');
    } finally {
      setJoinChatLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleLeaveSession = async (sessionId) => {
    try {
      setLeaveLoading(prev => ({ ...prev, [sessionId]: true }));
      setError('');
      setSuccess('');

      const response = await sessionService.leaveSession(sessionId);
      
      if (response.success) {
        setSuccess('Successfully left the session!');
        // Refresh sessions using the reusable function
        await fetchMySessions();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to leave session');
      }
    } catch (error) {
      setError('Failed to leave session');
    } finally {
      setLeaveLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = prompt('Please provide a reason for cancelling this session (optional):');
    
    // If user clicks cancel, don't proceed
    if (reason === null) return;
    
    try {
      setCancelLoading(prev => ({ ...prev, [sessionId]: true }));
      setError('');
      setSuccess('');

      const response = await sessionService.cancelSession(sessionId, reason);
      
      if (response.success) {
        setSuccess('Session successfully cancelled. All enrolled students have been notified.');
        // Refresh sessions using the reusable function
        await fetchMySessions();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.error || 'Failed to cancel session');
      }
    } catch (error) {
      setError('Failed to cancel session');
    } finally {
      setCancelLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Make refresh function available globally for other components to call
  React.useEffect(() => {
    // Expose refresh function to window for cross-component communication
    window.refreshMySessions = fetchMySessions;
    
    return () => {
      // Cleanup
      delete window.refreshMySessions;
    };
  }, []);

  const getStatusIcon = (session) => {
    const now = new Date();
    const isUpcoming = new Date(session.startTime) > now;
    const isCompleted = new Date(session.endTime) < now;
    
    // Check if student has left the session
    if (session.enrollmentStatus === 'left') {
      return <XCircle size={20} className="text-orange-500" />;
    }
    
    // Check if tutor cancelled the session
    if (session.status === 'cancelled') {
      return <XCircle size={20} className="text-destructive" />;
    }
    
    // Default status based on timing
    if (isCompleted) {
      return <CheckCircle size={20} className="text-success" />;
    }
    if (isUpcoming) {
      return <AlertCircle size={20} className="text-info" />;
    }
    
    return <Clock size={20} className="text-muted-foreground" />;
  };

  // Removed old filtering logic - now handled in useEffect above

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
              <p className="text-muted-foreground">
                {authService.getUserRole() === 'tutor' 
                  ? 'Manage your created tutoring sessions' 
                  : 'Manage your enrolled tutoring sessions'}
              </p>
            </div>
            
            <button
              onClick={fetchMySessions}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Success/Error Messages */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-destructive mr-2" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 transition-colors duration-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search sessions, modules, or tutors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>

            {/* Module Filter */}
            <div className="relative min-w-[180px]">
              <select 
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="appearance-none bg-background border border-border rounded-lg py-2 pl-3 pr-8 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              >
                <option value="all">All modules</option>
                {availableModules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>

            {/* Time Filter */}
            <div className="relative min-w-[140px]">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-background border border-border rounded-lg py-2 pl-3 pr-8 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              >
                <option value="any">Any time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">Next 7 Days</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
          </div>
        </div>

        {/* Status Filter tabs */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">{filteredSessions.length} Sessions Found</h2>
            <button className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors">
              <SlidersHorizontal className="mr-2" size={18} />
              Filters Active
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(() => {
              const userRole = authService.getUserRole();
              const baseFilters = [
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'completed', label: 'Completed' }
              ];
              
              // Add role-specific filters
              if (userRole === 'student') {
                baseFilters.push(
                  { key: 'left', label: 'Left Sessions' },
                  { key: 'cancelled', label: 'Cancelled by Tutor' }
                );
              } else {
                baseFilters.push(
                  { key: 'cancelled', label: 'Cancelled Sessions' }
                );
              }
              
              // Add All Sessions at the end
              baseFilters.push({ key: 'all', label: 'All Sessions' });
              
              return baseFilters;
            })().map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || moduleFilter !== 'all' || timeFilter !== 'any' || filter !== 'upcoming'
                ? 'No sessions match your current filters. Try adjusting your search criteria.'
                : authService.getUserRole() === 'tutor'
                ? "You have no upcoming sessions. Create a new session to get started."
                : "You have no upcoming sessions. Browse available sessions to join."}
            </p>
            {(!searchQuery && moduleFilter === 'all' && timeFilter === 'any' && filter === 'upcoming') && (
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => window.location.href = authService.getUserRole() === 'tutor' ? '/create-session' : '/browse-sessions'}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {authService.getUserRole() === 'tutor' ? 'Create Your First Session' : 'Browse Available Sessions'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSessions.map((session) => {
              const isUpcoming = new Date(session.startTime) > new Date();
              const isCompleted = new Date(session.endTime) < new Date();
              
              // Determine session status with proper priority
              let status = 'in-progress';
              let statusLabel = 'In Progress';
              
              if (session.enrollmentStatus === 'left') {
                status = 'left';
                statusLabel = 'Left Session';
              } else if (session.status === 'cancelled') {
                status = 'cancelled';
                statusLabel = 'Cancelled by Tutor';
              } else if (isCompleted) {
                status = 'completed';
                statusLabel = 'Completed';
              } else if (isUpcoming) {
                status = 'upcoming';
                statusLabel = 'Upcoming';
              }
              
              return (
                <div key={session.id} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <AvatarSmall
                          userId={session.tutorId}
                          userName={session.tutor}
                          userType="tutor"
                          size={40}
                          className="mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{session.module?.name || 'Session'}</h3>
                          <p className="text-sm text-muted-foreground">with {session.tutor || 'Tutor'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>{new Date(session.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          <span>{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          <span>{session.location || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(session)}
                          <span className="ml-2">{statusLabel}</span>
                        </div>
                      </div>

                      {session.module?.code && (
                        <div className="mb-4">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            {session.module.code}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex gap-2">
                      {authService.getUserRole() === 'student' ? (
                        // Student buttons
                        <>
                          {isUpcoming && session.enrollmentStatus !== 'left' && (
                            <>
                              <button 
                                onClick={() => handleJoinSessionChat(session.id)}
                                disabled={joinChatLoading[session.id]}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {joinChatLoading[session.id] ? (
                                  <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Joining Chat...
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Join Session Chat
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => handleLeaveSession(session.id)}
                                disabled={leaveLoading[session.id]}
                                className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {leaveLoading[session.id] ? (
                                  <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Leaving...
                                  </>
                                ) : (
                                  'Leave Session'
                                )}
                              </button>
                            </>
                          )}
                          {isCompleted && session.enrollmentStatus !== 'left' && (
                            <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium">
                              Rate Session
                            </button>
                          )}
                        </>
                      ) : (
                        // Tutor buttons
                        <>
                          {isUpcoming && status !== 'cancelled' && (
                            <>
                              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                Edit Session
                              </button>
                              <button 
                                onClick={() => handleCancelSession(session.id)}
                                disabled={cancelLoading[session.id]}
                                className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {cancelLoading[session.id] ? (
                                  <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Cancelling...
                                  </>
                                ) : (
                                  'Cancel Session'
                                )}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}