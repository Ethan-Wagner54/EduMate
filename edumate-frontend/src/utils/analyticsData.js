// Utility functions for processing analytics data into chart-ready formats

/**
 * Calculate growth percentage between two periods
 */
export const calculateGrowthPercentage = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

/**
 * Calculate cumulative totals for time series data
 */
export const calculateCumulativeData = (data, valueKey) => {
  let cumulative = 0;
  return data.map(item => {
    cumulative += item[valueKey] || 0;
    return {
      ...item,
      cumulative
    };
  });
};

/**
 * Process user growth data for analytics dashboard
 */
export const processUserGrowthData = (usersByMonth) => {
  if (!usersByMonth || usersByMonth.length === 0) return [];

  const processedData = usersByMonth.map((monthData, index) => {
    const prevMonth = index > 0 ? usersByMonth[index - 1] : null;
    const userGrowth = prevMonth 
      ? calculateGrowthPercentage(monthData.cumulativeUsers, prevMonth.cumulativeUsers)
      : 0;

    return {
      ...monthData,
      userGrowth,
      newUsers: monthData.totalUsers,
      totalUsers: monthData.cumulativeUsers
    };
  });

  return processedData;
};

/**
 * Process session trends data
 */
export const processSessionTrends = (sessionsByMonth) => {
  if (!sessionsByMonth || sessionsByMonth.length === 0) return [];

  return sessionsByMonth.map((monthData, index) => {
    const prevMonth = index > 0 ? sessionsByMonth[index - 1] : null;
    const sessionGrowth = prevMonth 
      ? calculateGrowthPercentage(monthData.totalSessions, prevMonth.totalSessions)
      : 0;

    const completionRate = monthData.totalSessions > 0 
      ? Math.round((monthData.completedSessions / monthData.totalSessions) * 100)
      : 0;

    return {
      ...monthData,
      sessionGrowth,
      completionRate,
      cancelRate: monthData.totalSessions > 0 
        ? Math.round((monthData.cancelledSessions / monthData.totalSessions) * 100)
        : 0
    };
  });
};

/**
 * Calculate summary statistics for the current period
 */
export const calculateAnalyticsSummary = (analyticsData) => {
  if (!analyticsData) return null;

  const { 
    usersByMonth, 
    sessionsByMonth, 
    engagementMetrics,
    totalUsers,
    totalSessions,
    activeUsers
  } = analyticsData;

  // Calculate current month vs previous month growth
  const currentMonth = usersByMonth[usersByMonth.length - 1];
  const previousMonth = usersByMonth[usersByMonth.length - 2];
  
  const currentSessionMonth = sessionsByMonth[sessionsByMonth.length - 1];
  const previousSessionMonth = sessionsByMonth[sessionsByMonth.length - 2];

  const userGrowth = previousMonth 
    ? calculateGrowthPercentage(currentMonth?.cumulativeUsers || 0, previousMonth?.cumulativeUsers || 0)
    : 0;

  const sessionGrowth = previousSessionMonth 
    ? calculateGrowthPercentage(currentSessionMonth?.totalSessions || 0, previousSessionMonth?.totalSessions || 0)
    : 0;

  // Calculate total message count (placeholder - would need real message data)
  const totalMessages = 0; // This would be calculated from actual message data

  return {
    totalUsers,
    totalSessions,
    totalMessages,
    activeUsers,
    userGrowth,
    sessionGrowth,
    engagementRate: engagementMetrics?.engagementRate || 0,
    completionRate: engagementMetrics?.completionRate || 0
  };
};

/**
 * Format data for pie charts
 */
export const formatPieChartData = (data, totalLabel = 'Total') => {
  if (!data || data.length === 0) return [];

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  })).filter(item => item.value > 0); // Filter out zero values
};

/**
 * Generate color palette for charts
 */
export const getChartColors = () => ({
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#f87171',
  blue: '#60a5fa',
  emerald: '#34d399',
  orange: '#fb923c'
});

/**
 * Format numbers for display in charts and cards
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (num, showSign = true) => {
  if (num === null || num === undefined) return '0%';
  const formatted = Math.abs(num).toFixed(1) + '%';
  if (!showSign) return formatted;
  return num > 0 ? `+${formatted}` : num < 0 ? `-${formatted}` : formatted;
};

/**
 * Generate mock historical data if real data is insufficient
 * This helps ensure charts always have meaningful data to display
 */
export const generateFallbackData = (realData, months = 6) => {
  if (realData && realData.length >= months) {
    return realData;
  }

  const fallbackData = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const baseValue = Math.floor(Math.random() * 20) + 5; // Random base between 5-25
    
    fallbackData.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
      totalUsers: baseValue + Math.floor(Math.random() * 10),
      totalSessions: baseValue * 2 + Math.floor(Math.random() * 15),
      completedSessions: Math.floor((baseValue * 2 + Math.floor(Math.random() * 15)) * 0.8),
      cancelledSessions: Math.floor((baseValue * 2 + Math.floor(Math.random() * 15)) * 0.1),
      cumulativeUsers: (i === months - 1 ? 0 : fallbackData[fallbackData.length - 1]?.cumulativeUsers || 0) + baseValue
    });
  }
  
  return fallbackData;
};