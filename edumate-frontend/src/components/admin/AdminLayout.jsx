import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedSidebar from '../UnifiedSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background">
      <UnifiedSidebar userType="admin" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}