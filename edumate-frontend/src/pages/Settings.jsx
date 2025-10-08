import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff } from 'lucide-react';
import authService from '../services/auth/auth';
import userService from '../services/user/user';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    studentId: '',
    phone: '',
    program: '',
    year: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    newMessages: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timeZone: 'Africa/Johannesburg',
    dateFormat: 'DD/MM/YYYY'
  });

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check authentication
        if (!authService.isAuthenticated()) {
          setError('User not authenticated');
          return;
        }

        const userRole = authService.getUserRole();
        const userId = authService.getUserId();
        
        
        // Get user data from API
        const response = await userService.getUser({ id: userId });
        
        if (response.success && response.data) {
          const user = response.data;
          
          // Map user data based on role
          const mappedData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          };
          
          if (userRole === 'student') {
            mappedData.studentId = user.id ? user.id.toString() : '';
            mappedData.program = user.program || 'Computer Science'; // Default for now
            mappedData.year = user.year || '3rd Year'; // Default for now
          } else if (userRole === 'tutor') {
            mappedData.tutorId = user.id ? user.id.toString() : '';
            mappedData.specialties = user.specialties || [];
            mappedData.department = user.department || 'Computer Science'; // Default for now
          } else if (userRole === 'admin') {
            mappedData.adminId = user.id ? user.id.toString() : '';
            mappedData.department = user.department || 'Administration'; // Default for now
          }
          
          setProfileData(mappedData);
        } else {
          setError(response.error || 'Failed to load user data');
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // API call would go here
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    // API call would go here
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveNotifications = () => {
    // API call would go here
    alert('Notification settings updated!');
  };

  const handleSavePreferences = () => {
    // API call would go here
    alert('Preferences updated!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="settings-form transition-colors duration-200">
                  <h2 className="text-xl font-semibold text-foreground mb-6 transition-colors duration-200">Profile Information</h2>
                  
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Loading user data...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}
                  
                  {!loading && !error && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))', borderColor: 'rgb(var(--border))' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))', borderColor: 'rgb(var(--border))' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">
                        {authService.getUserRole() === 'student' ? 'Student ID' : 
                         authService.getUserRole() === 'tutor' ? 'Tutor ID' : 
                         'Admin ID'}
                      </label>
                      <input
                        type="text"
                        value={profileData.studentId || profileData.tutorId || profileData.adminId || ''}
                        disabled
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground transition-all duration-200 cursor-not-allowed"
                        style={{ backgroundColor: 'rgb(var(--muted))', color: 'rgb(var(--muted-foreground))', borderColor: 'rgb(var(--border))' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))', borderColor: 'rgb(var(--border))' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">
                        {authService.getUserRole() === 'student' ? 'Program' : 'Department'}
                      </label>
                      <input
                        type="text"
                        value={profileData.program || profileData.department || ''}
                        onChange={(e) => handleProfileChange(
                          authService.getUserRole() === 'student' ? 'program' : 'department', 
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))', borderColor: 'rgb(var(--border))' }}
                      />
                    </div>
                    {authService.getUserRole() === 'student' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-200">Academic Year</label>
                        <select
                          value={profileData.year || ''}
                          onChange={(e) => handleProfileChange('year', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary [&>option]:bg-background [&>option]:text-foreground"
                          style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))', borderColor: 'rgb(var(--border))' }}
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                  </>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="settings-form">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Shield size={16} className="mr-2" />
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationChange(key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleSaveNotifications}
                      className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save size={16} className="mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="settings-form">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Application Preferences</h2>
                  <div className="space-y-6">
                    {/* Theme Section */}
                    <div className="p-6 border border-border rounded-lg">
                      <h3 className="text-lg font-medium text-foreground mb-4">Theme</h3>
                      <p className="text-sm text-muted-foreground mb-4">Choose how EduMate looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes.</p>
                      <ThemeToggle variant="menu" showLabels={true} size="md" />
                    </div>
                    
                    {/* Other preferences in a grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="en">English</option>
                        <option value="af">Afrikaans</option>
                        <option value="zu">isiZulu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Time Zone</label>
                      <select
                        value={preferences.timeZone}
                        onChange={(e) => handlePreferenceChange('timeZone', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleSavePreferences}
                      className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save size={16} className="mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}