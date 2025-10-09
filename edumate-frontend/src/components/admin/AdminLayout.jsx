import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import UnifiedSidebar from '../UnifiedSidebar';
import authService from '../../services/auth/auth';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Guard: only admins may access admin routes
    const isAuthed = authService.isAuthenticated();
    const role = authService.getUserRole();
    if (!isAuthed || role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userType="admin" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
