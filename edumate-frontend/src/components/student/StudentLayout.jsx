import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { GaugeCircle, Book, Calendar, Users, Star, MessageSquare, Settings, User, LogOut } from 'lucide-react';
import authService from '../../services/auth/auth';
import userService from '../../services/user/user';

export default function StudentLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('StudentLayout: Starting user fetch...');
        setLoading(true);
        setError(null);
        
        // Check authentication first
        if (!authService.isAuthenticated()) {
          console.log('StudentLayout: User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }

        const userId = authService.getUserId();
        console.log('StudentLayout: User ID from token:', userId);
        
        if (!userId) {
          console.error('StudentLayout: No user ID found in token');
          // Set fallback user data
          setUser({
            name: "John Smith",
            studentId: "42351673"
          });
          setLoading(false);
          return;
        }

        console.log('StudentLayout: Fetching user data...');
        const response = await userService.getUser({ id: userId });
        console.log('StudentLayout: User fetch response:', response);

        if (response.success && response.data) {
          console.log('StudentLayout: User data received:', response.data);
          setUser(response.data);
        } else {
          console.log('StudentLayout: User fetch failed, using fallback data');
          // Fallback user data
          setUser({
            name: "John Smith",
            studentId: "42351673"
          });
        }
      } catch (err) {
        console.error("StudentLayout: Error fetching user:", err);
        setError(err.message || 'Failed to load user data');
        // Set fallback user data
        setUser({
          name: "John Smith",
          studentId: "42351673"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    // Use the auth service logout function
    authService.logout();
    // Redirect to login
    navigate('/login');
  };

  const navigationItems = [
    {
      to: '/student',
      icon: GaugeCircle,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/student/browse-sessions',
      icon: Book,
      label: 'Browse Sessions'
    },
    {
      to: '/student/my-sessions',
      icon: Calendar,
      label: 'My Sessions'
    },
    {
      to: '/student/my-tutors',
      icon: Users,
      label: 'My Tutors'
    },
    {
      to: '/student/progress',
      icon: Star,
      label: 'Progress'
    },
    {
      to: '/student/session-history',
      icon: MessageSquare,
      label: 'Session History'
    }
  ];

  const isActiveRoute = (to, exact = false) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('StudentLayout: Rendering layout with user:', user);

  return (
    <div className="flex h-screen bg-background-secondary text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col p-4 shadow-lg">
        <div className="flex items-center justify-between p-2 mb-6">
          <div className="font-bold text-xl">EduMate</div>
        </div>

        {/* User Info */}
        <Link 
          to="/student/profile"
          className="p-4 flex items-center mb-4 border-b border-primary-foreground/20 pb-6 hover:bg-primary/80 rounded-lg transition-colors"
        >
          <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center font-bold text-secondary-foreground text-lg mr-3">
            {user?.name?.split(' ').map(word => word.charAt(0)).join('') || 'U'}
          </div>
          <div>
            <div className="text-sm font-semibold">{user?.name || 'Loading...'}</div>
            <div className="text-xs text-primary-foreground/70">{user?.studentId || ''}</div>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2 text-sm">
          {navigationItems.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center p-3 rounded-md transition-colors duration-200 font-semibold ${
                isActiveRoute(to, exact)
                  ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  : 'hover:bg-primary/80 text-primary-foreground'
              }`}
            >
              <Icon className="mr-3" size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 text-sm text-primary-foreground/70 mt-auto space-y-2">
          <Link
            to="/student/settings"
            className={`flex items-center transition-colors duration-200 p-3 rounded-md ${
              isActiveRoute('/student/settings')
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-primary/80 hover:text-primary-foreground'
            }`}
          >
            <Settings className="mr-3" size={18} />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center transition-colors duration-200 p-3 rounded-md hover:bg-destructive hover:text-destructive-foreground w-full text-left"
          >
            <LogOut className="mr-3" size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}