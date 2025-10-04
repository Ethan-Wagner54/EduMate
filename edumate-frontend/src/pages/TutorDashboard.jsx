import { useState, useEffect } from "react";
import SessionManagement from "../components/tutor/SessionManagement";
import { TutorProfile } from "../components/tutor/TutorProfile";
import { Button } from "../components/ui/button";
import authService from "../services/auth/auth";
import tutorDashboardService from "../services/tutor/tutorDashboard";

export default function TutorDashboard() {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('TutorDashboard: Fetching real dashboard data from API...');
        
        // Get tutor dashboard data from the new API endpoint
        const response = await tutorDashboardService.getTutorDashboard();
        
        if (response.success && response.data) {
          console.log('TutorDashboard: Real dashboard data received:', response.data);
          setTutor(response.data);
        } else {
          console.error('TutorDashboard: Failed to load dashboard data:', response.error);
          setError(response.error || 'Failed to load tutor dashboard data');
        }
        
      } catch (err) {
        console.error('TutorDashboard: Error loading dashboard data:', err);
        setError('Failed to load tutor dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, []);

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
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
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
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {tutor?.name || 'Tutor'}
          </h1>
          <Button
            variant="secondary"
            onClick={() => console.log("Logout logic here")}
          >
            Logout
          </Button>
        </header>

        <section className="space-y-6">
          <TutorProfile tutorData={tutor} />
          <SessionManagement />
        </section>
      </main>
    </div>
  );
}
