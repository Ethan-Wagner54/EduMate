import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedSidebar from '../UnifiedSidebar';

export default function StudentLayout() {

  return (
    <div className="flex h-screen bg-background-secondary text-foreground transition-colors duration-200">
      <UnifiedSidebar userType="student" />
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}