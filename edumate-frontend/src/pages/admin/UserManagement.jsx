import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, XCircle, AlertTriangle, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import adminService from '../../services/admin/adminService';

export default function UserManagement() {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [studentsRes, tutorsRes, pendingTutorsRes] = await Promise.all([
        adminService.getAllStudents(),
        adminService.getAllTutors(),
        adminService.getPendingTutors()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (tutorsRes.success) setTutors(tutorsRes.data || []);
      if (pendingTutorsRes.success) setPendingTutors(pendingTutorsRes.data || []);
    } catch (err) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTutor = async (tutorId) => {
    try {
      const response = await adminService.approveTutor(tutorId);
      if (response.success) {
        fetchData(); // Refresh data
      } else {
        alert('Failed to approve tutor: ' + response.error);
      }
    } catch (error) {
      alert('Error approving tutor');
    }
  };

  const handleRejectTutor = async (tutorId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      const response = await adminService.rejectTutor(tutorId, reason);
      if (response.success) {
        fetchData(); // Refresh data
      } else {
        alert('Failed to reject tutor: ' + response.error);
      }
    } catch (error) {
      alert('Error rejecting tutor');
    }
  };

  const handleDeactivateUser = async (userId, userType) => {
    if (window.confirm(`Are you sure you want to deactivate this ${userType}?`)) {
      try {
        const response = await adminService.deactivateUser(userId, userType);
        if (response.success) {
          fetchData(); // Refresh data
        } else {
          alert('Failed to deactivate user: ' + response.error);
        }
      } catch (error) {
        alert('Error deactivating user');
      }
    }
  };

  const handleReactivateUser = async (userId, userType) => {
    try {
      const response = await adminService.reactivateUser(userId, userType);
      if (response.success) {
        fetchData(); // Refresh data
      } else {
        alert('Failed to reactivate user: ' + response.error);
      }
    } catch (error) {
      alert('Error reactivating user');
    }
  };

  const handleViewDetails = (user, userType) => {
    setSelectedUser({ ...user, userType });
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedUser(null);
    setShowDetailsModal(false);
  };

  const UserCard = ({ user, userType, isPending = false }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              {!user.isActive && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Inactive
                </span>
              )}
              {isPending && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Pending Approval
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="font-medium">{user.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Joined:</span>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {userType === 'tutor' && (
                <>
                  <div>
                    <span className="text-muted-foreground">Subjects:</span>
                    <p className="font-medium">{user.subjects?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <p className="font-medium">{user.rating || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {isPending ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleApproveTutor(user.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleRejectTutor(user.id)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewDetails(user, userType)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {user.isActive ? (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeactivateUser(user.id, userType)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleReactivateUser(user.id, userType)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Reactivate
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DetailsModal = () => {
    if (!showDetailsModal || !selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card text-card-foreground rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">User Details</h2>
            <Button variant="ghost" size="sm" onClick={closeDetailsModal}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-lg">{selectedUser.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Type</label>
                <p className="text-lg capitalize">{selectedUser.userType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <p className={`text-lg font-semibold ${
                  selectedUser.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                <p className="text-lg">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            {selectedUser.userType === 'tutor' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Tutor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subjects</label>
                    <p className="text-lg">{selectedUser.subjects?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                    <p className="text-lg">{selectedUser.rating || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Campus Location</label>
                    <p className="text-lg">{selectedUser.campusLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warning Count</label>
                    <p className="text-lg">{selectedUser.warningsCount || 0}</p>
                  </div>
                </div>
                
                {selectedUser.tutorModules && selectedUser.tutorModules.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Teaching Modules</label>
                    <div className="mt-2 space-y-2">
                      {selectedUser.tutorModules.map((tm, index) => (
                        <div key={index} className="bg-muted p-2 rounded">
                          <p className="font-medium">{tm?.module?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{tm?.module?.code || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {selectedUser.userType === 'student' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="text-lg">{selectedUser.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Enrollment Status</label>
                    <p className="text-lg">{selectedUser.enrollmentStatus || 'Active'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={closeDetailsModal}>Close</Button>
          </div>
        </div>
      </div>
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
      <DetailsModal />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage students, tutors, and approval requests</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="tutors">
            Active Tutors ({tutors.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingTutors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              ) : (
                <div className="space-y-4">
                  {students.map(student => (
                    <UserCard key={student.id} user={student} userType="student" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Active Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tutors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active tutors found</p>
              ) : (
                <div className="space-y-4">
                  {tutors.map(tutor => (
                    <UserCard key={tutor.id} user={tutor} userType="tutor" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Pending Tutor Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTutors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingTutors.map(tutor => (
                    <UserCard key={tutor.id} user={tutor} userType="tutor" isPending={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}