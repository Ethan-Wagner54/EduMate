import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, BookOpen, Star, AlertTriangle, Plus, Edit, Trash2, Loader, CheckCircle, Eye, X } from 'lucide-react';
import sessionService from '../services/sessions/session';
import authService from '../services/auth/auth';

export default function TutorSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [cancelLoading, setCancelLoading] = useState({});
  const [publishLoading, setPublishLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  
  // Edit session modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    description: ''
  });

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

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
      setError('Failed to delete session');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [sessionId]: false }));
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
        // Refresh sessions
        const updatedResponse = await sessionService.getUserSessions();
        if (updatedResponse.success && updatedResponse.data) {
          setSessions(updatedResponse.data);
        }
        
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

  const handlePublishSession = async (sessionId) => {
    try {
      setPublishLoading(prev => ({ ...prev, [sessionId]: true }));
      setError('');
      setSuccess('');

      const response = await sessionService.updateSessionStatus(sessionId, 'published');
      
      if (response.success) {
        setSuccess('Session published successfully! It is now visible to students.');
        // Refresh sessions
        const updatedResponse = await sessionService.getUserSessions();
        if (updatedResponse.success && updatedResponse.data) {
          setSessions(updatedResponse.data);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to publish session');
      }
    } catch (error) {
      setError('Failed to publish session');
    } finally {
      setPublishLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setEditFormData({
      startTime: new Date(session.startTime).toISOString().slice(0, 16),
      endTime: new Date(session.endTime).toISOString().slice(0, 16),
      location: session.location || '',
      capacity: session.capacity || '',
      description: session.description || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSession(null);
    setEditFormData({
      startTime: '',
      endTime: '',
      location: '',
      capacity: '',
      description: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      setEditLoading(true);
      setError('');
      setSuccess('');

      const updateData = {
        startTime: new Date(editFormData.startTime).toISOString(),
        endTime: new Date(editFormData.endTime).toISOString(),
        location: editFormData.location,
        capacity: editFormData.capacity ? parseInt(editFormData.capacity) : null,
        description: editFormData.description
      };

      const response = await sessionService.editSession(editingSession.id, updateData);
      
      if (response.success) {
        setSuccess('Session updated successfully!');
        // Update the session in the local state
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === editingSession.id 
              ? { ...session, ...updateData }
              : session
          )
        );
        handleCloseEditModal();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to update session');
      }
    } catch (error) {
      setError('Failed to update session');
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSession(null);
  };

  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);

    switch (filter) {
      case 'upcoming':
        return sessionStart > now && session.status !== 'cancelled';
      case 'completed':
        return sessionEnd < now && session.status !== 'cancelled';
      case 'cancelled':
        return session.status === 'cancelled';
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
              to="/tutor/create-session"
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
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
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
              to="/tutor/create-session"
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

                      <div className="flex items-center gap-3 flex-wrap">
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
                        {session.status === 'draft' && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            Not visible to students
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex gap-2">
                      {session.status === 'draft' && isUpcoming && (
                        <button 
                          onClick={() => handlePublishSession(session.id)}
                          disabled={publishLoading[session.id]}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center"
                        >
                          {publishLoading[session.id] ? (
                            <Loader className="animate-spin h-4 w-4 mr-1" />
                          ) : (
                            <Eye className="h-4 w-4 mr-1" />
                          )}
                          {publishLoading[session.id] ? 'Publishing...' : 'Publish'}
                        </button>
                      )}
                      {isUpcoming && (
                        <>
                          <button 
                            onClick={() => handleEditSession(session)}
                            className="p-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
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
                        <button 
                          onClick={() => handleViewDetails(session)}
                          className="p-2 border border-border text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" 
                          title="View session details"
                        >
                          <Eye size={16} />
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

      {/* Edit Session Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Edit Session</h2>
              <button 
                onClick={handleCloseEditModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={editFormData.startTime}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={editFormData.endTime}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditFormChange}
                  placeholder="Enter session location"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={editFormData.capacity}
                  onChange={handleEditFormChange}
                  placeholder="Maximum number of students"
                  min="1"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  placeholder="Session description (optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {editLoading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Session Details</h2>
              <button 
                onClick={handleCloseDetailsModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Session Header */}
              <div className="flex items-center mb-4">
                <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-primary-foreground text-xl mr-4">
                  {selectedSession.module?.code?.substring(0, 2) || 'S'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedSession.module?.name || selectedSession.title}</h3>
                  <p className="text-muted-foreground">Tutoring Session</p>
                </div>
              </div>

              {/* Session Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3 flex items-center">
                      <Calendar size={18} className="mr-2" />
                      Date & Time
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-foreground font-medium">{new Date(selectedSession.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span className="text-foreground font-medium">{new Date(selectedSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Time:</span>
                        <span className="text-foreground font-medium">{new Date(selectedSession.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium">
                          {Math.round((new Date(selectedSession.endTime) - new Date(selectedSession.startTime)) / (1000 * 60))} minutes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3 flex items-center">
                      <MapPin size={18} className="mr-2" />
                      Location
                    </h4>
                    <p className="text-foreground">{selectedSession.location || 'No location specified'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3 flex items-center">
                      <Users size={18} className="mr-2" />
                      Enrollment
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Students Enrolled:</span>
                        <span className="text-foreground font-medium">{selectedSession.enrolledCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="text-foreground font-medium">{selectedSession.capacity || 'Unlimited'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability:</span>
                        <span className={`font-medium ${
                          selectedSession.capacity && selectedSession.enrolledCount >= selectedSession.capacity
                            ? 'text-destructive'
                            : 'text-success'
                        }`}>
                          {selectedSession.capacity && selectedSession.enrolledCount >= selectedSession.capacity
                            ? 'Full'
                            : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3">Status</h4>
                    <div className="space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        selectedSession.status === 'completed' 
                          ? 'bg-success/10 text-success' 
                          : selectedSession.status === 'cancelled'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {selectedSession.status === 'completed' ? 'Completed' : selectedSession.status}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        Module: {selectedSession.module?.code || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedSession.description && (
                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">Description</h4>
                  <p className="text-foreground text-sm leading-relaxed">{selectedSession.description}</p>
                </div>
              )}

              {/* Enrolled Students */}
              {selectedSession.enrolledStudents && selectedSession.enrolledStudents.length > 0 && (
                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3 flex items-center">
                    <Users size={18} className="mr-2" />
                    Enrolled Students ({selectedSession.enrolledStudents.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedSession.enrolledStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-primary">
                              {student.name ? student.name.split(' ').map(n => n.charAt(0)).join('') : 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.name || 'Student'}</p>
                            <p className="text-xs text-muted-foreground">{student.email || 'No email'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Enrolled {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}