import React, { useState, useEffect } from 'react';
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
    // TODO: Implement API call to get tutors data
    // const fetchTutors = async () => {
    //   const response = await adminService.getTutors();
    //   setTutors(response.data);
    //   setStats(prev => ({ ...prev, totalTutors: response.data.length }));
    // };
    // fetchTutors();
    setTutors([]);
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {admin.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Tutors</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalTutors}</dd>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSessions}</dd>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeStudents}</dd>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">System Status</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.systemStatus}</dd>
          </div>
        </div>

        {/* Tutors Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Tutor Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">All registered tutors in the system</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tutors.map((tutor) => (
                  <tr key={tutor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tutor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.modules.join(", ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
