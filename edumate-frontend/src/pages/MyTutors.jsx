import React, { useState, useEffect } from 'react';
import { Star, Calendar, MessageSquare, BookOpen, User } from 'lucide-react';
import tutorService from '../services/tutor/tutor';
import MessagingModal from '../components/student/MessagingModal';
import { useNavigate } from 'react-router-dom';
import { AvatarMedium } from '../components/ui/Avatar';
import MessagingModal from '../components/student/MessagingModal';

export default function MyTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagingTutor, setMessagingTutor] = useState(null);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTutors = async () => {
      try {
        // This would typically be an API call to get tutors for the current student
        // For now, we'll use mock data since the endpoint might not exist yet
        const mockTutors = [
          {
            id: 1,
            name: "Sarah Johnson",
            email: "sarah@example.com",
            modules: ["MATH 101", "CALC 201"],
            rating: 4.9,
            totalSessions: 12,
            completedSessions: 10,
            nextSession: "2024-12-03T14:00:00",
            specialties: ["Calculus", "Algebra", "Statistics"]
          },
          {
            id: 2,
            name: "Michael Chen",
            email: "michael@example.com",
            modules: ["CS 201", "CS 301"],
            rating: 4.8,
            totalSessions: 8,
            completedSessions: 6,
            nextSession: "2024-12-04T16:00:00",
            specialties: ["Programming", "Data Structures", "Algorithms"]
          },
          {
            id: 3,
            name: "Emily Rodriguez",
            email: "emily@example.com",
            modules: ["CHEM 201"],
            rating: 4.7,
            totalSessions: 6,
            completedSessions: 4,
            nextSession: null,
            specialties: ["Organic Chemistry", "Lab Techniques"]
          }
        ];
        setTutors(mockTutors);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      } finally {
        setLoading(false);
      }
    };

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
    navigate(`/student/tutor-sessions/${tutor.id}`);
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

        {tutors.length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tutors yet</h3>
            <p className="text-muted-foreground">Start by browsing and joining sessions to connect with tutors.</p>
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

                {/* Modules */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tutor.modules.map((module, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-card-foreground mb-2">Specialties:</h4>
                  <p className="text-sm text-muted-foreground">{tutor.specialties.join(', ')}</p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{tutor.completedSessions}/{tutor.totalSessions} sessions</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tutor.completedSessions / tutor.totalSessions) * 100}%` }}
                    ></div>
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
