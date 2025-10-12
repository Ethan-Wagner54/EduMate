import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, BookOpen, Target, Award, AlertTriangle } from 'lucide-react';
import PerformanceOverTime from '../components/progress/PerformanceOverTime';
import progressService from '../services/progress/progress';

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [moduleProgress, setModuleProgress] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await progressService.getStudentProgress();
        
        if (response.success && response.data) {
          setStats(response.data.stats);
          setModuleProgress(response.data.moduleProgress);
          setRecentActivity(response.data.recentActivity);
        } else {
          setError(response.error || 'Failed to load progress data');
        }
      } catch (err) {
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Progress</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Progress Data</h3>
            <p className="text-muted-foreground">Start attending sessions to see your progress here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BookOpen size={20} className="text-info" />
            <span className="text-2xl font-bold text-foreground">{stats?.totalSessions || 0}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target size={20} className="text-success" />
            <span className="text-2xl font-bold text-foreground">{stats?.completedSessions || 0}</span>
          </div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-warning" />
            <span className="text-2xl font-bold text-foreground">{stats?.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
          <p className="text-sm text-muted-foreground">Avg Rating</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-primary" />
            <span className="text-2xl font-bold text-foreground">{stats?.hoursStudied || 0}</span>
          </div>
          <p className="text-sm text-muted-foreground">Hours Studied</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BookOpen size={20} className="text-info" />
            <span className="text-2xl font-bold text-foreground">{stats?.activeModules || 0}</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Modules</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Award size={20} className="text-warning" />
            <span className="text-2xl font-bold text-foreground">{stats?.streak || 0}</span>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module Progress */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Module Progress</h2>
            <div className="space-y-6">
              {moduleProgress && moduleProgress.length > 0 ? (
                moduleProgress.map((module, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <p className="text-sm text-muted-foreground">{module.code} • with {module.tutor}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{module.progress}%</div>
                      <div className="text-xs text-muted-foreground">{module.sessionsCompleted}/{module.totalSessions} sessions</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Average Grade: {module.averageGrade}%</span>
                    <span>{module.totalSessions - module.sessionsCompleted} sessions remaining</span>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No module progress data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Enroll in sessions to see your progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-accent rounded-lg">
                  <div className="bg-primary rounded-full p-2">
                    <BookOpen size={16} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground">{activity.activity}</h4>
                      <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity.details}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        {activity.module}
                      </span>
                      <div className="flex items-center">
                        <Star size={14} className="text-warning fill-current mr-1" />
                        <span className="text-sm text-muted-foreground">{activity.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete sessions to see activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Over Time Component */}
        <div className="mt-8">
          <PerformanceOverTime />
        </div>
      </div>
    </div>
  );
}