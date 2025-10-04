/**
 * Performance Data Utility
 * 
 * Generates realistic performance data for student progress tracking
 */

/**
 * Generate performance data over time from real API data or generate fallback
 */
export const generatePerformanceData = (realData = null, months = 6) => {
  // If real performance data is provided, use it
  if (realData && Array.isArray(realData) && realData.length > 0) {
    return realData;
  }
  
  // Fallback: return empty array instead of hardcoded data
  return [];
};

/**
 * Generate module-specific performance data from real API data
 */
export const generateModulePerformanceData = (moduleData = null) => {
  // If real module data is provided, use it
  if (moduleData && Array.isArray(moduleData) && moduleData.length > 0) {
    return moduleData;
  }
  
  // Fallback: return empty array instead of hardcoded data
  return [];
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
 * Generate achievement/milestone data from real API data
 */
export const generateAchievementData = (achievementsData = null) => {
  // If real achievements data is provided, use it
  if (achievementsData && Array.isArray(achievementsData) && achievementsData.length > 0) {
    return achievementsData.map(achievement => ({
      ...achievement,
      dateObj: new Date(achievement.date)
    })).sort((a, b) => b.dateObj - a.dateObj);
  }
  
  // Fallback: return empty array
  return [];
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