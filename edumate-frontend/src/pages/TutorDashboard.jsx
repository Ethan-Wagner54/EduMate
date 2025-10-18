import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SessionManagement from "../components/tutor/SessionManagement";
import { TutorProfile } from "../components/tutor/TutorProfile";
import authService from "../services/auth/auth";
import tutorDashboardService from "../services/tutor/tutorDashboard";

export default function TutorDashboard() {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication first
      if (!authService.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        authService.logout(); // Clear any invalid tokens
        navigate('/login');
        return;
      }
      
      // Verify user role
      const userRole = authService.getUserRole();
      if (userRole !== 'tutor') {
        console.log('User is not a tutor, redirecting based on role:', userRole);
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'student') {
          navigate('/student');
        } else {
          navigate('/login');
        }
        return;
      }
      
      // Get tutor dashboard data from the API endpoint
      const response = await tutorDashboardService.getTutorDashboard();
      
      if (response.success && response.data) {
        setTutor(response.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        // Handle specific error cases
        let errorMessage = response.error || 'Failed to load tutor dashboard data';
        
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          console.log('Unauthorized access, clearing auth and redirecting');
          authService.logout();
          navigate('/login');
          return;
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'You do not have permission to access the tutor dashboard.';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Tutor dashboard service is not available. Please contact support.';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        }
        
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      
      // Handle network errors
      if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        setError('Network connection failed. Please check your internet connection and try again.');
      } else {
        setError('Unexpected error occurred while loading dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <main className="flex-1 p-6 md:p-10 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Tutor Dashboard</h1>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <main className="flex-1 p-6 md:p-10 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Tutor Dashboard</h1>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-destructive mb-2">Unable to load dashboard</p>
              <p className="text-muted-foreground text-sm">{error || 'No tutor data available'}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button 
                  onClick={() => fetchTutorData()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Retry
                </button>
                <button 
                  onClick={() => {
                    authService.logout();
                    navigate('/login');
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar is rendered via TutorLayout */}
      <main className="flex-1 p-6 md:p-10 space-y-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {tutor?.name || 'Tutor'}
          </h1>
        </header>

        <section className="space-y-6">
          <TutorProfile tutorData={tutor} />
          <SessionManagement />
        </section>
      </main>
    </div>
  );
}
