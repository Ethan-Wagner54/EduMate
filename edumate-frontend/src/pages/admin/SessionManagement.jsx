import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Edit, Trash2, Eye, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import adminService from '../../services/admin/adminService';

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getAllSessions();
      if (response.success) {
        setSessions(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.tutorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        const response = await adminService.deleteSession(sessionId);
        if (response.success) {
          fetchSessions(); // Refresh data
        } else {
          alert('Failed to delete session: ' + response.error);
        }
      } catch (error) {
        alert('Error deleting session');
      }
    }
  };

  const handleViewDetails = async (sessionId) => {
    try {
      const response = await adminService.getSessionDetails(sessionId);
      if (response.success) {
        setSelectedSession(response.data);
        setShowDetailsModal(true);
      } else {
        alert('Failed to fetch session details: ' + response.error);
      }
    } catch (error) {
      alert('Error fetching session details');
    }
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updates) => {
    try {
      const response = await adminService.updateSession(selectedSession.id, updates);
      if (response.success) {
        setShowEditModal(false);
        fetchSessions(); // Refresh data
        alert('Session updated successfully!');
      } else {
        alert('Failed to update session: ' + response.error);
      }
    } catch (error) {
      alert('Error updating session');
    }
  };

  const SessionCard = ({ session }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'scheduled': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-gray-100 text-gray-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{session.title}</h3>
                  <p className="text-muted-foreground text-sm">{session.subject}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                  {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Tutor:</span>
                    <p className="font-medium">{session.tutorName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">
                      {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{session.location || 'Online'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Students:</span>
                    <p className="font-medium">{session.participants?.length || 0}</p>
                  </div>
                </div>
              </div>

              {session.description && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{session.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewDetails(session.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleEditSession(session)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDeleteSession(session.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">View, edit, and manage all tutoring sessions</p>
        </div>
        <Button onClick={fetchSessions} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Sessions</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by title, subject, tutor, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            All Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {sessions.length === 0 ? 'No sessions found' : 'No sessions match your filters'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Session Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-lg font-semibold">{selectedSession.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-lg">{selectedSession.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tutor</label>
                  <p className="text-lg">{selectedSession.tutorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    selectedSession.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedSession.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    selectedSession.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedSession.status?.charAt(0).toUpperCase() + selectedSession.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                  <p className="text-lg">
                    {selectedSession.scheduledAt ? new Date(selectedSession.scheduledAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-lg">{selectedSession.location || 'Online'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Students Enrolled</label>
                  <p className="text-lg">{selectedSession.participants?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Session ID</label>
                  <p className="text-lg font-mono text-sm">{selectedSession.id}</p>
                </div>
              </div>
              
              {selectedSession.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedSession.description}</p>
                  </div>
                </div>
              )}
              
              {selectedSession.participants && selectedSession.participants.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrolled Students</label>
                  <div className="mt-2 space-y-2">
                    {selectedSession.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{participant.name || `Student ${index + 1}`}</span>
                        <span className="text-xs text-gray-500">({participant.email || 'No email'})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal with actual functionality */}
      {showEditModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Session</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = {
                  title: formData.get('title'),
                  location: formData.get('location'),
                  status: formData.get('status'),
                  description: formData.get('description')
                };
                handleSaveEdit(updates);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Title</label>
                    <Input 
                      name="title" 
                      defaultValue={selectedSession.title} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Location</label>
                    <Input 
                      name="location" 
                      defaultValue={selectedSession.location || ''} 
                      placeholder="Online or physical location" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Status</label>
                    <select 
                      name="status"
                      defaultValue={selectedSession.status}
                      className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <textarea 
                      name="description"
                      defaultValue={selectedSession.description || ''}
                      placeholder="Session description..."
                      rows="3"
                      className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}