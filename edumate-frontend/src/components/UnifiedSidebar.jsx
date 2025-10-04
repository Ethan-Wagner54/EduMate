import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GaugeCircle, 
  Book, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  History, 
  Settings, 
  LogOut, 
  PlusCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import authService from '../services/auth/auth';
import userService from '../services/user/user';
import { AvatarSmall } from './ui/Avatar';

// Navigation configuration for different user types
const navigationConfig = {
  student: [
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
      to: '/student/group-chats',
      icon: MessageSquare,
      label: 'Group Chats'
    },
    {
      to: '/student/progress',
      icon: Star,
      label: 'Progress'
    },
    {
      to: '/student/session-history',
      icon: History,
      label: 'Session History'
    }
  ],
  tutor: [
    {
      to: '/tutor',
      icon: GaugeCircle,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/tutor/create-session',
      icon: PlusCircle,
      label: 'Create Session'
    },
    {
      to: '/tutor/sessions',
      icon: Calendar,
      label: 'My Sessions'
    },
    {
      to: '/tutor/messages',
      icon: MessageSquare,
      label: 'Messages'
    },
    {
      to: '/tutor/group-chats',
      icon: Users,
      label: 'Group Chats'
    }
  ],
  admin: [
    {
      to: '/admin',
      icon: GaugeCircle,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'User Management'
    },
    {
      to: '/admin/sessions',
      icon: Calendar,
      label: 'Session Management'
    },
    {
      to: '/admin/analytics',
      icon: Star,
      label: 'Analytics'
    }
  ]
};

export default function UnifiedSidebar({ userType = 'student' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('UnifiedSidebar: Starting user fetch...');
        setLoading(true);
        setError(null);
        
        // Check authentication first
        if (!authService.isAuthenticated()) {
          console.log('UnifiedSidebar: User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }

        const userId = authService.getUserId();
        console.log('UnifiedSidebar: User ID from token:', userId);
        
        if (!userId) {
          console.error('UnifiedSidebar: No user ID found in token');
          setError('No user ID found');
          setLoading(false);
          return;
        }

        console.log('UnifiedSidebar: Fetching user data...');
        const response = await userService.getUser({ id: userId });
        console.log('UnifiedSidebar: User fetch response:', response);

        if (response.success && response.data) {
          console.log('UnifiedSidebar: User data received:', response.data);
          setUser(response.data);
        } else {
          console.log('UnifiedSidebar: User fetch failed:', response.error);
          setError(response.error || 'Failed to load user data');
        }
      } catch (err) {
        console.error("UnifiedSidebar: Error fetching user:", err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, userType]);

  const handleLogout = () => {
    // Use the auth service logout function
    authService.logout();
    // Redirect to login
    navigate('/login');
  };

  const navigationItems = navigationConfig[userType] || navigationConfig.student;
  
  const isActiveRoute = (to, exact = false) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const getProfilePath = () => {
    return `/${userType}/profile`;
  };

  const getSettingsPath = () => {
    return `/${userType}/settings`;
  };

  const getUserDisplayId = () => {
    if (userType === 'student') return user?.studentId || '';
    if (userType === 'tutor') return user?.tutorId || '';
    if (userType === 'admin') return user?.adminId || '';
    return '';
  };

  // Show loading state
  if (loading) {
    return (
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col p-4 shadow-lg">
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
        </div>
      </aside>
    );
  }

  // Show error state but still render sidebar with limited functionality
  if (error) {
    console.error('UnifiedSidebar: Rendering with error:', error);
  }

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col p-4 shadow-lg">
      <div className="flex items-center justify-between p-2 mb-6">
        <div className="font-bold text-xl">EduMate</div>
      </div>

      {/* User Info */}
      {user ? (
        <Link 
          to={getProfilePath()}
          className="p-4 flex items-center mb-4 border-b border-primary-foreground/20 pb-6 hover:bg-primary/80 rounded-lg transition-colors"
        >
          <AvatarSmall
            userId={user?.id || authService.getUserId()}
            userName={user?.name}
            userType={userType}
            size={40}
            className="mr-3"
          />
          <div>
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-primary-foreground/70">{getUserDisplayId()}</div>
          </div>
        </Link>
      ) : (
        <div className="p-4 flex items-center mb-4 border-b border-primary-foreground/20 pb-6">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full mr-3 flex items-center justify-center">
            <div className="w-6 h-6 bg-primary-foreground/30 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm font-semibold">{error ? 'Error loading' : 'Loading...'}</div>
            <div className="text-xs text-primary-foreground/70">{error ? 'user data' : 'Please wait'}</div>
          </div>
        </div>
      )}

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
          to={getSettingsPath()}
          className={`flex items-center transition-colors duration-200 p-3 rounded-md ${
            isActiveRoute(getSettingsPath())
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
  );
}