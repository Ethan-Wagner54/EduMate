/**
 * Performance Data Utility
 * 
 * Generates realistic performance data for student progress tracking
 */

/**
 * Generate performance data over time
 */
export const generatePerformanceData = (months = 6) => {
  const data = [];
  const currentDate = new Date();
  
  // Create data for the last 'months' months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    // Generate realistic trending data (generally improving over time)
    const baseGrade = 65 + (months - i - 1) * 2 + Math.random() * 8; // Gradual improvement
    const baseRating = 3.8 + (months - i - 1) * 0.1 + Math.random() * 0.4; // Rating improvement
    const sessionsCompleted = Math.floor(2 + Math.random() * 6); // 2-8 sessions per month
    const hoursStudied = sessionsCompleted * 1.5 + Math.random() * 5; // 1.5 hours per session + extra
    
    data.push({
      month: `${monthName} ${year}`,
      monthShort: monthName,
      averageGrade: Math.min(100, Math.round(baseGrade * 10) / 10),
      sessionRating: Math.min(5, Math.round(baseRating * 10) / 10),
      sessionsCompleted,
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      modulesActive: Math.floor(3 + Math.random() * 3), // 3-6 modules
      attendanceRate: Math.round((85 + Math.random() * 12) * 10) / 10, // 85-97%
    });
  }
  
  return data;
};

/**
 * Generate module-specific performance data
 */
export const generateModulePerformanceData = () => {
  const modules = [
    { code: 'CMPG-321', name: 'Software Engineering', color: '#8884d8' },
    { code: 'ACCF-111', name: 'Introduction to Accounting', color: '#82ca9d' },
    { code: 'MATH-101', name: 'Mathematics I', color: '#ffc658' },
    { code: 'STAT-110', name: 'Statistics', color: '#ff7300' },
    { code: 'ECON-101', name: 'Economics', color: '#00c49f' }
  ];
  
  return modules.map(module => {
    // Generate 6 months of data for each module
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Generate realistic grade progression (generally improving)
      const baseGrade = 60 + (5 - i) * 3 + Math.random() * 15;
      data.push({
        month,
        grade: Math.min(100, Math.round(baseGrade))
      });
    }
    
    return {
      ...module,
      data,
      currentGrade: data[data.length - 1].grade,
      trend: data[data.length - 1].grade > data[0].grade ? 'up' : 'down'
    };
  });
};

/**
 * Generate weekly study hours data
 */
export const generateWeeklyStudyData = (weeks = 12) => {
  const data = [];
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7));
    const weekLabel = `Week ${weeks - i}`;
    
    // Generate realistic study hours with some variation
    const baseHours = 8 + Math.random() * 6; // 8-14 hours per week
    const sessionsThisWeek = Math.floor(2 + Math.random() * 4); // 2-6 sessions
    
    data.push({
      week: weekLabel,
      date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hoursStudied: Math.round(baseHours * 10) / 10,
      sessionsCompleted: sessionsThisWeek,
      averageSessionLength: Math.round((baseHours / sessionsThisWeek) * 10) / 10
    });
  }
  
  return data;
};

/**
 * Generate achievement/milestone data
 */
export const generateAchievementData = () => {
  const achievements = [
    { name: 'First A Grade', date: '2024-09-15', module: 'MATH-101', icon: '🎯' },
    { name: '5 Sessions Streak', date: '2024-10-01', module: 'All', icon: '🔥' },
    { name: '90% Attendance', date: '2024-10-15', module: 'All', icon: '📚' },
    { name: 'Module Completed', date: '2024-11-01', module: 'ACCF-111', icon: '✅' },
    { name: 'Top Performer', date: '2024-11-20', module: 'CMPG-321', icon: '⭐' }
  ];
  
  return achievements.map(achievement => ({
    ...achievement,
    dateObj: new Date(achievement.date)
  })).sort((a, b) => b.dateObj - a.dateObj);
};

/**
 * Calculate performance summary statistics
 */
export const calculatePerformanceSummary = (performanceData) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }
  
  const latest = performanceData[performanceData.length - 1];
  const previous = performanceData[performanceData.length - 2];
  
  const gradeChange = previous ? (latest.averageGrade - previous.averageGrade).toFixed(1) : 0;
  const ratingChange = previous ? (latest.sessionRating - previous.sessionRating).toFixed(1) : 0;
  const hoursChange = previous ? (latest.hoursStudied - previous.hoursStudied).toFixed(1) : 0;
  
  return {
    currentGrade: latest.averageGrade,
    gradeChange: parseFloat(gradeChange),
    currentRating: latest.sessionRating,
    ratingChange: parseFloat(ratingChange),
    totalHours: performanceData.reduce((sum, month) => sum + month.hoursStudied, 0).toFixed(1),
    hoursChange: parseFloat(hoursChange),
    totalSessions: performanceData.reduce((sum, month) => sum + month.sessionsCompleted, 0),
    averageAttendance: (performanceData.reduce((sum, month) => sum + month.attendanceRate, 0) / performanceData.length).toFixed(1)
  };
};