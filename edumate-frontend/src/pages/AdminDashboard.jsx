import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import adminService from '../services/admin/adminService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get admin info from navigation state
  const admin = location.state?.email ? { email: location.state.email } : { email: "Admin" };

  const [tutors, setTutors] = useState([]);
  const [stats, setStats] = useState({
    totalTutors: 0,
    totalSessions: 0,
    activeStudents: 0,
    systemStatus: "Operational",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tutorsRes, sessionsRes] = await Promise.all([
          adminService.getAllTutors(),
          adminService.getAllSessions()
        ]);
        if (tutorsRes.success) {
          const list = tutorsRes.data || [];
          setTutors(list);
          setStats(prev => ({ ...prev, totalTutors: list.length }));
        }
        if (sessionsRes.success) {
          const sessions = sessionsRes.data || [];
          setStats(prev => ({ ...prev, totalSessions: sessions.length }));
        }
      } catch (e) {
        // ignore for now; UI will show zeros
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card shadow rounded-lg p-6 border">
            <dt className="text-sm font-medium text-muted-foreground truncate">Total Tutors</dt>
            <dd className="mt-1 text-3xl font-semibold text-foreground">{stats.totalTutors}</dd>
          </div>
          <div className="bg-card shadow rounded-lg p-6 border">
            <dt className="text-sm font-medium text-muted-foreground truncate">Active Sessions</dt>
            <dd className="mt-1 text-3xl font-semibold text-foreground">{stats.totalSessions}</dd>
          </div>
          <div className="bg-card shadow rounded-lg p-6 border">
            <dt className="text-sm font-medium text-muted-foreground truncate">Active Students</dt>
            <dd className="mt-1 text-3xl font-semibold text-foreground">{stats.activeStudents}</dd>
          </div>
          <div className="bg-card shadow rounded-lg p-6 border">
            <dt className="text-sm font-medium text-muted-foreground truncate">System Status</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.systemStatus}</dd>
          </div>
        </div>

        {/* Tutors Table */}
        <div className="bg-card shadow overflow-hidden sm:rounded-lg border">
          <div className="px-4 py-5 sm:px-6 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-foreground">Tutors</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">All active tutors in the system</p>
            </div>
            <span className="text-sm text-muted-foreground">Total: {tutors.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Warnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Modules</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {tutors.map((tutor) => {
                  const modules = Array.isArray(tutor.tutorModules)
                    ? tutor.tutorModules.map((tm) => tm?.module?.code || tm?.module?.name).filter(Boolean)
                    : [];
                  return (
                    <tr key={tutor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{tutor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tutor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tutor.isActive !== false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tutor.warningsCount ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{tutor.campusLocation || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{modules.length > 0 ? modules.join(', ') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
            onClick={() => navigate('/admin/users')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">User Management</p>
                  <p className="text-lg font-semibold text-foreground">Manage accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
            onClick={() => navigate('/admin/sessions')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Session Management</p>
                  <p className="text-lg font-semibold text-foreground">Monitor sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
            onClick={() => navigate('/admin/chats')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Chat Moderation</p>
                  <p className="text-lg font-semibold text-foreground">Review messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
