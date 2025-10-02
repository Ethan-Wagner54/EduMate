import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, BookOpen, ArrowLeft, Star, AlertTriangle } from 'lucide-react';
import sessionHistoryService from '../services/sessionHistory/sessionHistory';

export default function TutorSessions() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed

  useEffect(() => {
    const fetchTutorAndSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionHistoryService.getTutorSessions(parseInt(tutorId));
        if (response.success && response.data) {
          setTutor(response.data.tutor);
          setSessions(response.data.sessions || []);
        } else {
          setError(response.error || 'Failed to load tutor sessions');
          // If tutor not found, redirect back
          if (response.error && response.error.includes('not found')) {
            navigate('/student/my-tutors');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching tutor sessions:', err);
        setError('Failed to load tutor sessions');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorAndSessions();
    }
  }, [tutorId, navigate]);

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tutor sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Tutor</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Tutor not found</h3>
          <p className="text-muted-foreground">The tutor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/student/my-tutors"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to My Tutors
          </Link>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center font-bold text-primary-foreground text-2xl mr-6">
                  {getInitials(tutor.name)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{tutor.name}'s Sessions</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      <span>{tutor.rating} rating</span>
                    </div>
                    <span>•</span>
                    <span>{tutor.totalSessions} total sessions</span>
                    <span>•</span>
                    <span>{tutor.specialties.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex flex-wrap gap-2">
                  {tutor.modules.map((module, index) => (
                    <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "This tutor hasn't scheduled any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
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
                          {getInitials(session.tutor.name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{session.module.name}</h3>
                          <p className="text-sm text-muted-foreground">with {session.tutor.name}</p>
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
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          <span>{session.enrolled}/{session.capacity} enrolled</span>
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                      )}

                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          {session.module.code}
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
                    
                    <div className="ml-6">
                      {isUpcoming && session.enrolled < session.capacity && (
                        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                          Join Session
                        </button>
                      )}
                      {isUpcoming && session.enrolled >= session.capacity && (
                        <button disabled className="px-6 py-2 bg-muted text-muted-foreground rounded-lg font-medium cursor-not-allowed">
                          Session Full
                        </button>
                      )}
                      {isCompleted && (
                        <button className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium">
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