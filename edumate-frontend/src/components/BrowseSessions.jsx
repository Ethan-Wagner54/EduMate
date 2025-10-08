// src/components/BrowseSessions.jsx
import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Star, Users, Filter, SlidersHorizontal, ChevronDown, Hourglass, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import sessionService from '../services/sessions/session';
import authService from '../services/auth/auth';
import { AvatarSmall } from './ui/Avatar';

export default function BrowseSessions() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('any');
  const [availableModules, setAvailableModules] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionService.getSessions();
        if (response.success) {
          setSessions(response.data || []);
          setFilteredSessions(response.data || []);
          
          // Extract unique modules for filter dropdown
          const modules = [...new Set((response.data || []).map(session => session.course))];
          setAvailableModules(modules);
        } else {
          setError(response.error || 'Failed to load sessions');
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter sessions based on search query, module, and time
  useEffect(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.tutor.toLowerCase().includes(query) ||
        session.course.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query)
      );
    }

    // Apply module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(session => session.course === moduleFilter);
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

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, moduleFilter, timeFilter]);

  const [joinLoading, setJoinLoading] = useState({});
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const handleJoinSession = async (sessionId) => {
    try {
      setJoinLoading(prev => ({ ...prev, [sessionId]: true }));
      setJoinError('');
      setJoinSuccess('');

      const response = await sessionService.joinSession(sessionId);
      
      if (response.success) {
        setJoinSuccess('Successfully joined session!');
        // Refresh sessions to update enrollment count
        const updatedSessions = await sessionService.getSessions();
        if (updatedSessions.success) {
          setSessions(updatedSessions.data || []);
          setFilteredSessions(updatedSessions.data || []);
        }
        
        // Refresh MySessions if the function is available
        if (typeof window.refreshMySessions === 'function') {
          await window.refreshMySessions();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setJoinSuccess(''), 3000);
      } else {
        setJoinError(response.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      setJoinError('Failed to join session');
    } finally {
      setJoinLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Sessions</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background transition-colors duration-200 p-8 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Search className="mr-3 text-muted-foreground" size={24}/>
            Browse Upcoming Sessions
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover and join upcoming tutoring sessions that you can participate in.
        </p>
        
        {/* Success/Error Messages */}
        {joinError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
            <span className="text-destructive text-sm">{joinError}</span>
          </div>
        )}
        
        {joinSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700 text-sm">{joinSuccess}</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex items-center space-x-4 transition-colors duration-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search upcoming sessions, modules, or tutors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        <div className="relative">
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="appearance-none bg-background border border-border rounded-lg py-2 pl-3 pr-8 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="all">All modules</option>
            {availableModules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        </div>

        <div className="relative">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none bg-background border border-border rounded-lg py-2 pl-3 pr-8 text-foreground leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="any">Any time</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">Next 7 Days</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">{filteredSessions.length} Upcoming Sessions</h2>
        <button className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors">
          <SlidersHorizontal className="mr-2" size={18} />
          More Filters
        </button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
          <p className="text-muted-foreground">
            {searchQuery || moduleFilter !== 'all' || timeFilter !== 'any' 
              ? 'No upcoming sessions match your search criteria. Try adjusting your filters.'
              : 'No upcoming tutoring sessions are currently available. Check back later for new sessions!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map(session => (
            <div key={session.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{session.course}</span>
                  {session.isFree && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">Free</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{session.title}</h3>

                <div className="flex items-center mb-4">
                  <AvatarSmall
                    userId={session.tutorId}
                    userName={session.tutor}
                    userType="tutor"
                    size={32}
                    className="mr-3 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium text-foreground">{session.tutor}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" /> 
                      {session.rating ? session.rating.toFixed(1) : 'Not rated'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p className="flex items-center">
                    <Calendar size={16} className="mr-2" /> {session.time}
                  </p>
                  <p className="flex items-center">
                    <MapPin size={16} className="mr-2" /> {session.location || 'TBA'}
                  </p>
                  <p className="flex items-center">
                    <Users size={16} className="mr-2" /> {session.enrolled || `${session.enrolledCount || 0}/${session.capacity || 'unlimited'} enrolled`}
                  </p>
                </div>

                <p className="text-sm text-foreground/80 mb-6">{session.description}</p>
              </div>

              <div className="flex justify-between items-center mt-auto">
                {authService.getUserRole() === 'student' ? (
                  <button 
                    onClick={() => handleJoinSession(session.id)}
                    disabled={joinLoading[session.id]}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {joinLoading[session.id] ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join Session'
                    )}
                  </button>
                ) : (
                  <span className="text-muted-foreground text-sm">Login as student to join</span>
                )}
                <button className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Hourglass size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}