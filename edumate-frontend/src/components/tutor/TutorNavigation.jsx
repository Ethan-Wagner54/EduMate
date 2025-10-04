import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { LayoutDashboard, PlusCircle, User, MessageSquare, ChevronLeft, ChevronRight, LogOut, BookOpen, Settings } from 'lucide-react';
import authService from '../../services/auth/auth';
import userService from '../../services/user/user';
import { AvatarSmall } from '../ui/Avatar';

const TutorNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Check authentication first
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const userId = authService.getUserId();
        
        if (!userId) {
          console.error('TutorNavigation: No user ID found in token');
          setLoading(false);
          return;
        }

        const response = await userService.getUser({ id: userId });

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          console.error('TutorNavigation: Failed to load user data:', response.error);
        }
      } catch (err) {
        console.error("TutorNavigation: Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const navigationItems = [
    { name: 'Dashboard', path: '/tutor', icon: <LayoutDashboard size={18} /> },
    { name: 'Create Session', path: '/tutor/create-session', icon: <PlusCircle size={18} /> },
    { name: 'My Sessions', path: '/tutor/sessions', icon: <BookOpen size={18} /> },
    { name: 'Messages', path: '/tutor/messages', icon: <MessageSquare size={18} /> },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          bg-primary text-primary-foreground shadow-lg
        `}
      >
        <div className="flex items-center justify-between p-2 mb-6">
          {!collapsed && (
            <div className="font-bold text-xl">EduMate</div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-primary/70 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* User Info - Only show when not collapsed and not loading */}
        {!collapsed && !loading && user && (
          <Link 
            to="/tutor/profile"
            className="p-4 flex items-center mb-4 border-b border-primary-foreground/20 pb-6 hover:bg-primary/80 rounded-lg transition-colors"
          >
            <AvatarSmall
              userId={user?.id || authService.getUserId()}
              userName={user?.name}
              userType="tutor"
              size={40}
              className="mr-3"
            />
            <div>
              <div className="text-sm font-semibold">{user?.name || 'Loading...'}</div>
              <div className="text-xs text-primary-foreground/70">{user?.tutorId || ''}</div>
            </div>
          </Link>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2 text-sm">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-md transition-colors duration-200 font-semibold
                ${isActivePath(item.path)
                  ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  : 'hover:bg-primary/80 text-primary-foreground'
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {!collapsed && item.name}
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 text-sm text-primary-foreground/70 mt-auto space-y-2">
          <Link
            to="/tutor/settings"
            className={`flex items-center transition-colors duration-200 p-3 rounded-md ${
              isActivePath('/tutor/settings')
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-primary/80 hover:text-primary-foreground'
            }`}
          >
            <Settings className="mr-3" size={18} />
            {!collapsed && "Settings"}
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center transition-colors duration-200 p-3 rounded-md hover:bg-destructive hover:text-destructive-foreground w-full text-left"
          >
            <LogOut className="mr-3" size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-primary text-primary-foreground shadow-sm border-b border-primary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/tutor" 
                className="flex-shrink-0 flex items-center font-bold text-primary-foreground"
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
              <div className="px-2 pt-2 pb-3 space-y-1 bg-primary border-t border-primary/50">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-secondary text-secondary-foreground border-l-4 border-secondary/80'
                        : 'hover:bg-primary/80 text-primary-foreground'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/tutor/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath('/tutor/profile')
                      ? 'bg-secondary text-secondary-foreground border-l-4 border-secondary/80'
                      : 'hover:bg-primary/80 text-primary-foreground'
                  }`}
                >
                  <User size={18} className="mr-3 inline" />
                  My Profile
                </Link>
                <Link
                  to="/tutor/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath('/tutor/settings')
                      ? 'bg-secondary text-secondary-foreground border-l-4 border-secondary/80'
                      : 'hover:bg-primary/80 text-primary-foreground'
                  }`}
                >
                  <Settings size={18} className="mr-3 inline" />
                  Settings
                </Link>
                <div className="px-3 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center transition-colors duration-200 p-3 rounded-md hover:bg-destructive hover:text-destructive-foreground w-full text-left"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
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
