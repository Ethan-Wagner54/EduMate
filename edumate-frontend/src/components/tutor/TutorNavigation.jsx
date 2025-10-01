import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { LayoutDashboard, PlusCircle, User, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'; 

const TutorNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/tutor', icon: <LayoutDashboard size={20} /> },
    { name: 'Create Session', path: '/tutor/create-session', icon: <PlusCircle size={20} /> },
    { name: 'My Profile', path: '/tutor/profile', icon: <User size={20} /> },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    console.log("Logout logic here");
    navigate('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          bg-edumatePurpleLight text-card-foreground border-r border-border
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-primary/90 border-b border-border">
          {!collapsed && (
            <span className="text-xl font-bold text-card-foreground">
              EduMate Tutor
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-primary/70 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-2 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground border-l-4 border-primary/80'
                    : 'text-card-foreground hover:bg-primary/70 hover:text-card-foreground'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-primary/50 p-4">
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            className="w-full justify-center bg-primary/80 hover:bg-primary/70 text-card-foreground"
          >
            <LogOut size={18} className="mr-2" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-edumatePurpleLight text-card-foreground shadow-sm border-b border-primary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/tutor" 
                className="flex-shrink-0 flex items-center font-bold text-card-foreground"
              >
                EduMate Tutor
              </Link>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <div className="w-6 h-6 flex flex-col justify-center">
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
                </div>
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-edumatePurpleLight border-t border-primary/50">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-primary text-primary-foreground border-l-4 border-primary/80'
                        : 'hover:bg-primary/70 text-card-foreground'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                <div className="px-3 py-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleLogout}
                    className="w-full justify-start bg-primary/80 hover:bg-primary/70 text-card-foreground"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default TutorNavigation;
