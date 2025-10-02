import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Calendar, Star, Edit3, MapPin, Award } from 'lucide-react';
import authService from '../services/auth/auth';
import ImageUpload from '../components/ui/ImageUpload';
import { loadProfilePicture, removeProfilePicture } from '../utils/imageUtils';

export default function TutorProfilePage() {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user ID from auth service
        const userId = authService.getUserId();
        
        // For now, let's use mock data for tutors since the backend might not be ready
        // In a real app, this would be: const response = await tutorService.getTutorProfile(userId);
        
        // Mock tutor data based on user ID
        const mockTutorData = {
          id: userId || 1,
          name: "Dr. Jane Smith",
          email: "jane.smith@nwu.ac.za",
          phone: "+27 83 123 4567",
          location: "Potchefstroom Campus",
          bio: "Passionate mathematics and statistics tutor with 5+ years of experience helping students excel in their academic journey.",
          modules: ["MATH111", "STAT141", "MATH141", "CALC101"],
          qualifications: [
            {
              degree: "PhD in Mathematics",
              institution: "North-West University",
              year: "2019",
              status: "Verified"
            },
            {
              degree: "MSc in Applied Mathematics", 
              institution: "University of Cape Town",
              year: "2016",
              status: "Verified"
            },
            {
              degree: "BSc Honours in Mathematics",
              institution: "North-West University", 
              year: "2014",
              status: "Verified"
            }
          ],
          achievements: [
            {
              title: "Outstanding Tutor Award",
              description: "Recognized for exceptional student support and academic excellence",
              date: "2024"
            },
            {
              title: "Top Rated Tutor",
              description: "Maintained 4.8+ rating for 12 consecutive months",
              date: "2024"
            },
            {
              title: "Student Favorite",
              description: "Most requested tutor in Mathematics department",
              date: "2023"
            }
          ],
          stats: {
            totalSessions: 156,
            totalStudents: 89,
            averageRating: 4.8,
            completionRate: 94,
            yearsExperience: 5
          },
          availability: {
            monday: { enabled: true, start: "08:00", end: "17:00" },
            tuesday: { enabled: true, start: "08:00", end: "17:00" },
            wednesday: { enabled: true, start: "08:00", end: "17:00" },
            thursday: { enabled: true, start: "08:00", end: "17:00" },
            friday: { enabled: true, start: "08:00", end: "15:00" },
            saturday: { enabled: false, start: "09:00", end: "13:00" },
            sunday: { enabled: false, start: "09:00", end: "13:00" }
          },
          preferences: {
            maxStudentsPerSession: 15,
            sessionDuration: 120,
            advanceBooking: 24,
            autoConfirm: true
          }
        };
        
        setTutor(mockTutorData);
        setEditData(mockTutorData);
        
        // Load existing profile picture
        const savedImage = loadProfilePicture(userId || 1, 'tutor');
        setProfilePicture(savedImage);
        
      } catch (error) {
        console.error('Error fetching tutor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // API call to update tutor would go here
      console.log('Saving tutor profile:', editData);
      setTutor(editData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData(tutor);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (imageUrl) => {
    setProfilePicture(imageUrl);
    if (!imageUrl) {
      // Remove from storage
      const userId = authService.getUserId();
      removeProfilePicture(userId || 1, 'tutor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Profile not found</h3>
          <p className="text-muted-foreground">Unable to load your tutor profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-12 text-primary-foreground">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {isEditing ? (
                    <ImageUpload
                      currentImage={profilePicture}
                      onImageChange={handleProfilePictureChange}
                      userId={authService.getUserId() || 1}
                      userType="tutor"
                      userName={tutor.name}
                      size={120}
                    />
                  ) : (
                    <div className="relative">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt={tutor.name}
                          className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-primary-foreground/20"
                        />
                      ) : (
                        <div className="bg-primary-foreground bg-opacity-20 rounded-full w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center font-bold text-2xl lg:text-3xl">
                          {tutor.name?.split(' ').map(word => word.charAt(0)).join('') || 'T'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Name and Info */}
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold">{tutor.name}</h1>
                  <p className="text-primary-foreground/80 text-lg">{tutor.location}</p>
                  <div className="flex items-center justify-center lg:justify-start mt-2">
                    <Star className="w-5 h-5 text-yellow-300 fill-current mr-1" />
                    <span className="text-primary-foreground/90 font-medium">{tutor.stats.averageRating}/5.0</span>
                    <span className="text-primary-foreground/60 ml-2">• {tutor.stats.yearsExperience} years experience</span>
                  </div>
                </div>
              </div>
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="flex items-center px-4 py-2 bg-primary-foreground bg-opacity-20 text-primary-foreground rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Edit3 size={16} className="mr-2" />
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Personal & Professional Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Bio Section */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">About Me</h2>
                  {isEditing ? (
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <div className="flex items-center">
                        <Mail size={16} className="text-muted-foreground mr-2" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="text-foreground">{tutor.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <div className="flex items-center">
                        <Phone size={16} className="text-muted-foreground mr-2" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editData.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="text-foreground">{tutor.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Campus Location</label>
                      <div className="flex items-center">
                        <MapPin size={16} className="text-muted-foreground mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="text-foreground">{tutor.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Teaching Modules</h2>
                  <div className="flex flex-wrap gap-2">
                    {tutor.modules?.map((module, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Qualifications</h2>
                  <div className="space-y-4">
                    {tutor.qualifications?.map((qualification, index) => (
                      <div key={index} className="border-l-4 border-success pl-4 py-2">
                        <h4 className="font-semibold text-foreground">{qualification.degree}</h4>
                        <p className="text-sm text-muted-foreground">
                          {qualification.institution} • {qualification.year}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-success/10 text-success rounded">
                          {qualification.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons for Edit Mode */}
                {isEditing && (
                  <div className="flex gap-4 pt-6 border-t border-border">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

              </div>

              {/* Right Column - Statistics & Achievements */}
              <div className="space-y-8">
                
                {/* Teaching Statistics */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Teaching Statistics</h2>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen size={20} className="text-blue-500" />
                        <span className="text-2xl font-bold text-foreground">{tutor.stats.totalSessions}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <User size={20} className="text-green-500" />
                        <span className="text-2xl font-bold text-foreground">{tutor.stats.totalStudents}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Students Helped</p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Star size={20} className="text-yellow-500" />
                        <span className="text-2xl font-bold text-foreground">{tutor.stats.averageRating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar size={20} className="text-purple-500" />
                        <span className="text-2xl font-bold text-foreground">{tutor.stats.completionRate}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Recent Achievements</h2>
                  <div className="space-y-4">
                    {tutor.achievements?.map((achievement, index) => (
                      <div key={index} className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                            <span className="text-xs text-warning font-medium mt-2 inline-block">{achievement.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}