import React, { useState, useEffect } from 'react';
import { Star, Calendar, MessageSquare, BookOpen, User, Clock, AlertCircle } from 'lucide-react';
import MessagingModal from '../components/student/MessagingModal';
import { useNavigate } from 'react-router-dom';
import { AvatarMedium } from '../components/ui/Avatar';
import studentTutorsService from '../services/tutors/studentTutorsService';
import { toast } from 'react-toastify';

export default function MyTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagingTutor, setMessagingTutor] = useState(null);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMyTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentTutorsService.getMyTutors();
      
      if (response.success) {
        const formattedTutors = response.data.tutors.map(tutor => 
          studentTutorsService.formatTutorForDisplay(tutor)
        );
        setTutors(formattedTutors);
      } else {
        setError(response.error);
        toast.error(response.error || 'Failed to load tutors');
      }
    } catch (error) {
      setError('Failed to load tutors');
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTutors();
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('');
  };

  const handleMessageTutor = (tutor) => {
    setMessagingTutor(tutor);
    setIsMessagingOpen(true);
  };

  const handleViewTutorSessions = (tutor) => {
    // Navigate to browse sessions with tutor name as search parameter
    navigate(`/student/browse-sessions?tutor=${encodeURIComponent(tutor.name)}`);
  };

  const handleCloseMessaging = () => {
    setIsMessagingOpen(false);
    setMessagingTutor(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Tutors</h1>
          <p className="text-muted-foreground">Manage your tutoring relationships and track progress</p>
        </div>

        {tutors.length === 0 && !loading && !error ? (
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tutors yet</h3>
            <p className="text-muted-foreground mb-4">Join sessions to start building relationships with tutors. They'll appear here automatically!</p>
            <button 
              onClick={() => navigate('/student/browse-sessions')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Sessions
            </button>
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Error loading tutors</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => fetchMyTutors()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-4">
                  <AvatarMedium
                    userId={tutor.id}
                    userName={tutor.name}
                    userType="tutor"
                    size={48}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{tutor.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star size={14} className="text-warning fill-current mr-1" />
                      <span>{tutor.rating}</span>
                      <span className="mx-2">•</span>
                      <span>{tutor.totalSessions} sessions</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {tutor.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
                  </div>
                )}

                {/* Modules */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tutor.modules.map((module, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        {module.code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                {tutor.specialties.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-card-foreground mb-2">Specialties:</h4>
                    <p className="text-sm text-muted-foreground">{tutor.specialties.join(', ')}</p>
                  </div>
                )}

                {/* Session History */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Sessions Together</span>
                    <span>{tutor.totalSessionsTogether}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>First Session</span>
                    <span>{new Date(tutor.firstSessionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Last Session</span>
                    <span>{new Date(tutor.lastSessionDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Online Status */}
                <div className="mb-4">
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${tutor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={tutor.isOnline ? 'text-green-600' : 'text-muted-foreground'}>
                      {tutor.isOnline ? 'Online now' : `Last seen ${new Date(tutor.lastSeen).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>

                {/* Next Session */}
                {tutor.nextSession && (
                  <div className="mb-4 p-3 bg-info/10 rounded-lg">
                    <div className="flex items-center text-sm text-info">
                      <Calendar size={14} className="mr-2" />
                      <span>Next session: {new Date(tutor.nextSession).toLocaleDateString()} at {new Date(tutor.nextSession).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMessageTutor(tutor)}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <MessageSquare size={14} className="inline mr-2" />
                    Message
                  </button>
                  <button 
                    onClick={() => handleViewTutorSessions(tutor)}
                    className="flex-1 px-3 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-sm"
                  >
                    <BookOpen size={14} className="inline mr-2" />
                    Sessions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Messaging Modal */}
        <MessagingModal 
          tutor={messagingTutor}
          isOpen={isMessagingOpen}
          onClose={handleCloseMessaging}
        />
      </div>
    </div>
  );
}
