import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, MessageSquare, Settings, LogOut } from 'lucide-react'; // Example icons
import ThemeToggle from './ui/ThemeToggle';

export default function Sidebar() {
  const location = useLocation();

  // Function to determine if a link is active for highlighting
  const isActive = (path) => location.pathname === path;

  // The Tailwind classes for the sidebar container
  const sidebarClasses = 'w-64 flex flex-col p-4 bg-white shadow-xl rounded-r-2xl h-full sticky top-0';
  
  // The Tailwind class for active links
  const activeLinkClasses = 'bg-indigo-600 text-white font-semibold shadow-md';
  
  // The Tailwind class for inactive links
  const inactiveLinkClasses = 'text-gray-600 hover:bg-gray-100 transition-colors duration-150';

  return (
    <div className={sidebarClasses}>
      {/* Logo/Header Section */}
      <div className="text-2xl font-bold text-indigo-600 mb-8 p-2 border-b border-gray-100">
        <span className="text-gray-800">Study</span> Buddy
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-2">
        
        {/* Dashboard Link */}
        <Link 
          to="/" 
          className={`flex items-center p-3 rounded-xl ${isActive('/') ? activeLinkClasses : inactiveLinkClasses}`}
        >
          <LayoutDashboard className="mr-3" size={18} />
          Dashboard
        </Link>

        {/* Browse Sessions Link (The target of your routing) */}
        <Link 
          to="/browse-sessions" 
          className={`flex items-center p-3 rounded-xl ${isActive('/browse-sessions') ? activeLinkClasses : inactiveLinkClasses}`}
        >
          <Book className="mr-3" size={18} />
          Browse Sessions
        </Link>
        
        {/* Placeholder Link Example */}
        <Link 
          to="/messages" 
          className={`flex items-center p-3 rounded-xl ${isActive('/messages') ? activeLinkClasses : inactiveLinkClasses}`}
        >
          <MessageSquare className="mr-3" size={18} />
          Messages
        </Link>

        <Link 
          to="/settings" 
          className={`flex items-center p-3 rounded-xl ${isActive('/settings') ? activeLinkClasses : inactiveLinkClasses}`}
        >
          <Settings className="mr-3" size={18} />
          Settings
        </Link>

      </nav>

      {/* Footer/Logout Section */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-2">
          <span className="text-sm text-gray-600">Theme</span>
          <ThemeToggle variant="dropdown" size="sm" />
        </div>
        
        <button 
          className={`flex items-center p-3 w-full rounded-xl text-red-500 hover:bg-red-50 focus:outline-none transition-colors duration-150`}
        >
          <LogOut className="mr-3" size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}