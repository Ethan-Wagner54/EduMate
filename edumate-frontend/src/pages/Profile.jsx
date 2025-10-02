import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Calendar, Star, Edit3 } from 'lucide-react';
import userService from '../services/user/user';
import authService from '../services/auth/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = authService.getUserId();
        const response = await userService.getUser({ id: userId });

        if (response.success && response.data) {
          setUser(response.data);
          setEditData(response.data);
        } else {
          // Fallback to mock data
          const mockUser = {
            id: 1,
            name: "John Smith",
            email: "student1@edumate.com",
            role: "student",
            studentId: "42351673",
            phone: "+27 12 345 6789",
            program: "Computer Science",
            year: "3rd Year",
            faculty: "Engineering",
            joinDate: "2022-01-15",
            totalSessions: 24,
            completedSessions: 18,
            averageRating: 4.7,
            favoriteSubjects: ["Programming", "Mathematics", "Software Engineering"]
          };
          setUser(mockUser);
          setEditData(mockUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // API call to update user would go here
      console.log('Saving user data:', editData);
      setUser(editData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Profile not found</h3>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-12 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-foreground bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center font-bold text-3xl mr-6">
                  {user.name?.split(' ').map(word => word.charAt(0)).join('') || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-primary-foreground/80 text-lg">{user.program} • {user.year}</p>
                  <p className="text-primary-foreground/60 text-sm">Student ID: {user.studentId}</p>
                </div>
              </div>
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="flex items-center px-4 py-2 bg-primary-foreground bg-opacity-20 text-primary-foreground rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Edit3 size={16} className="mr-2" />
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-foreground mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <p className="text-foreground">{user.name}</p>
                    )}
                  </div>
                  
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
                        <p className="text-foreground">{user.email}</p>
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
                        <p className="text-foreground">{user.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Student ID</label>
                    <p className="text-muted-foreground">{user.studentId}</p>
                    <small className="text-xs text-muted-foreground">This cannot be changed</small>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Program</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.program || ''}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <p className="text-foreground">{user.program}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Academic Year</label>
                    {isEditing ? (
                      <select
                        value={editData.year || ''}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    ) : (
                      <p className="text-foreground">{user.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Faculty</label>
                    <p className="text-foreground">{user.faculty}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Member Since</label>
                    <div className="flex items-center">
                      <Calendar size={16} className="text-muted-foreground mr-2" />
                      <p className="text-foreground">{new Date(user.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Favorite Subjects */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Favorite Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteSubjects?.map((subject, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex gap-4">
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

              {/* Statistics */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-foreground mb-6">Learning Statistics</h2>
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen size={20} className="text-blue-500" />
                      <span className="text-2xl font-bold text-foreground">{user.totalSessions}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar size={20} className="text-green-500" />
                      <span className="text-2xl font-bold text-foreground">{user.completedSessions}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Completed Sessions</p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Star size={20} className="text-yellow-500" />
                      <span className="text-2xl font-bold text-foreground">{user.averageRating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>

                  {/* Progress */}
                  <div className="bg-muted/50 rounded-xl p-6">
                    <h4 className="font-medium text-foreground mb-3">Completion Rate</h4>
                    <div className="w-full bg-border rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-colors duration-200"
                        style={{ width: `${(user.completedSessions / user.totalSessions) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((user.completedSessions / user.totalSessions) * 100)}% complete
                    </p>
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