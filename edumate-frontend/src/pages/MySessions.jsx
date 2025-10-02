import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import sessionService from '../services/sessions/session';
import authService from '../services/auth/auth';

export default function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    const fetchMySessions = async () => {
      try {
        const userId = authService.getUserId();
        // This would be an API call to get sessions for the current user
        const response = await sessionService.getUserSessions(userId);
        if (response.success && response.data) {
          setSessions(response.data);
        }
      } catch (error) {
        console.error('Error fetching my sessions:', error);
        // Fallback to getting all sessions for now
        const response = await sessionService.getSessions();
        if (response.success && response.data) {
          setSessions(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMySessions();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" />;
      case 'cancelled':
        return <XCircle size={20} className="text-destructive" />;
      case 'upcoming':
        return <AlertCircle size={20} className="text-info" />;
      default:
        return <Clock size={20} className="text-muted-foreground" />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(session.startTime) > new Date();
    if (filter === 'completed') return new Date(session.endTime) < new Date();
    return session.status === filter;
  });

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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
          <p className="text-muted-foreground">Manage your enrolled tutoring sessions</p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(({ key, label }) => (
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
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You haven't enrolled in any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSessions.map((session) => {
              const isUpcoming = new Date(session.startTime) > new Date();
              const isCompleted = new Date(session.endTime) < new Date();
              const status = isCompleted ? 'completed' : isUpcoming ? 'upcoming' : 'in-progress';
              
              return (
                <div key={session.id} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-primary-foreground text-lg mr-4">
                          {session.tutor?.name?.split(' ').map(word => word.charAt(0)).join('') || 'T'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{session.module?.name || 'Session'}</h3>
                          <p className="text-sm text-muted-foreground">with {session.tutor?.name || 'Tutor'}</p>
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
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize">{status.replace('-', ' ')}</span>
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
                      {isUpcoming && (
                        <>
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                            Join
                          </button>
                          <button className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium">
                            Cancel
                          </button>
                        </>
                      )}
                      {isCompleted && (
                        <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium">
                          Rate Session
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