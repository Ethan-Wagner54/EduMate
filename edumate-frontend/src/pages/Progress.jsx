import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, BookOpen, Target, Award } from 'lucide-react';
import PerformanceOverTime from '../components/progress/PerformanceOverTime';

export default function Progress() {
  const [stats, setStats] = useState({
    totalSessions: 24,
    completedSessions: 18,
    averageRating: 4.7,
    hoursStudied: 36,
    activeModules: 5,
    streak: 7
  });

  const [moduleProgress, setModuleProgress] = useState([
    {
      name: "Software Engineering",
      code: "CMPG-321",
      progress: 85,
      sessionsCompleted: 8,
      totalSessions: 10,
      averageGrade: 87,
      tutor: "Jane Doe"
    },
    {
      name: "Introduction to Accounting",
      code: "ACCF-111",
      progress: 70,
      sessionsCompleted: 6,
      totalSessions: 8,
      averageGrade: 78,
      tutor: "John Smith"
    },
    {
      name: "Mathematics I",
      code: "MATH-101",
      progress: 60,
      sessionsCompleted: 4,
      totalSessions: 8,
      averageGrade: 82,
      tutor: "Sarah Johnson"
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      date: "2024-12-02",
      activity: "Completed session",
      module: "CMPG-321",
      details: "Object-Oriented Programming with Jane Doe",
      rating: 5
    },
    {
      date: "2024-11-30",
      activity: "Session attended",
      module: "ACCF-111",
      details: "Financial Statements with John Smith",
      rating: 4
    },
    {
      date: "2024-11-28",
      activity: "Session completed",
      module: "MATH-101",
      details: "Calculus Fundamentals with Sarah Johnson",
      rating: 5
    }
  ]);

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
              <span className="text-2xl font-bold text-foreground">{stats.totalSessions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Target size={20} className="text-success" />
              <span className="text-2xl font-bold text-foreground">{stats.completedSessions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Star size={20} className="text-warning" />
              <span className="text-2xl font-bold text-foreground">{stats.averageRating}</span>
            </div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar size={20} className="text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats.hoursStudied}</span>
            </div>
            <p className="text-sm text-muted-foreground">Hours Studied</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BookOpen size={20} className="text-info" />
              <span className="text-2xl font-bold text-foreground">{stats.activeModules}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Modules</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Award size={20} className="text-warning" />
              <span className="text-2xl font-bold text-foreground">{stats.streak}</span>
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module Progress */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Module Progress</h2>
            <div className="space-y-6">
              {moduleProgress.map((module, index) => (
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
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
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
              ))}
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