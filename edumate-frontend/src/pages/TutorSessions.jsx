import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, BookOpen, Star, AlertTriangle, Plus, Edit, Trash2, Loader, CheckCircle } from 'lucide-react';
import sessionService from '../services/sessions/session';
import authService from '../services/auth/auth';

export default function TutorSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, completed

  useEffect(() => {
    // Check if user is a tutor
    const userRole = authService.getUserRole();
    if (userRole !== 'tutor') {
      navigate('/');
      return;
    }

    const fetchTutorSessions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await sessionService.getUserSessions();
        if (response.success && response.data) {
          setSessions(response.data);
        } else {
          setError(response.error || 'Failed to load sessions');
        }
      } catch (err) {
        console.error('Error fetching tutor sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorSessions();
  }, [navigate]);

  const handleDeleteSession = async (sessionId) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [sessionId]: true }));
      setError('');
      setSuccess('');

      const response = await sessionService.deleteSession(sessionId);
      
      if (response.success) {
        setSuccess('Session deleted successfully!');
        // Refresh sessions
        const updatedResponse = await sessionService.getUserSessions();
        if (updatedResponse.success && updatedResponse.data) {
          setSessions(updatedResponse.data);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);

    switch (filter) {
      case 'upcoming':
        return sessionStart > now;
      case 'completed':
        return sessionEnd < now;
      default:
        return true;
    }
  });

  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
              <p className="text-muted-foreground">Manage your tutoring sessions</p>
            </div>
            
            <Link
              to="/create-session"
              className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus size={20} className="mr-2" />
              Create New Session
            </Link>
          </div>
          
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
              <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center transition-colors duration-200">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "You haven't created any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
            <Link
              to="/create-session"
              className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Session
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSessions.map((session) => {
              const isUpcoming = new Date(session.startTime) > new Date();
              const isCompleted = new Date(session.endTime) < new Date();
              
              return (
                <div key={session.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-primary-foreground text-lg mr-4">
                          {session.module?.code?.substring(0, 2) || 'S'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{session.module?.name || session.title}</h3>
                          <p className="text-sm text-muted-foreground">Your tutoring session</p>
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
                          <span>{session.location || 'TBA'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          <span>{session.enrolledCount || 0}/{session.capacity || '∞'} enrolled</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          {session.module?.code || session.course}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          isCompleted 
                            ? 'bg-success/10 text-success' 
                            : isUpcoming 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? 'completed' : isUpcoming ? 'upcoming' : session.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex gap-2">
                      {isUpcoming && (
                        <>
                          <button className="p-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
                                handleDeleteSession(session.id);
                              }
                            }}
                            disabled={deleteLoading[session.id]}
                            className="p-2 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading[session.id] ? (
                              <Loader className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </>
                      )}
                      {isCompleted && (
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                          View Details
                        </button>
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