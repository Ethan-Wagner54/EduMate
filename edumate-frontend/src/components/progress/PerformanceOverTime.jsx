import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Filter, Star, Clock, BookOpen } from 'lucide-react';
import { 
  generatePerformanceData, 
  generateModulePerformanceData, 
  generateWeeklyStudyData, 
  calculatePerformanceSummary 
} from '../../utils/performanceData';

export default function PerformanceOverTime() {
  const [performanceData, setPerformanceData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    // Generate data based on selected time period
    const months = timePeriod === '3months' ? 3 : timePeriod === '12months' ? 12 : 6;
    const weeks = timePeriod === '3months' ? 12 : timePeriod === '12months' ? 52 : 24;
    
    const perfData = generatePerformanceData(months);
    const modData = generateModulePerformanceData();
    const weekData = generateWeeklyStudyData(weeks);
    const summaryData = calculatePerformanceSummary(perfData);
    
    setPerformanceData(perfData);
    setModuleData(modData);
    setWeeklyData(weekData);
    setSummary(summaryData);
  }, [timePeriod]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Grade') ? '%' : entry.name.includes('Rating') ? '/5' : entry.name.includes('Hours') ? 'h' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className={`text-${color}`} />
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-center text-xs">
        {change > 0 ? (
          <TrendingUp size={14} className="text-success mr-1" />
        ) : change < 0 ? (
          <TrendingDown size={14} className="text-destructive mr-1" />
        ) : null}
        <span className={change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground'}>
          {change > 0 ? '+' : ''}{change} from last month
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Performance Over Time</h2>
          <p className="text-sm text-muted-foreground">Track your academic progress and improvement trends</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-3 py-1 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          
          {/* Chart Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select 
              value={activeChart} 
              onChange={(e) => setActiveChart(e.target.value)}
              className="px-3 py-1 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="overview">Overview</option>
              <option value="grades">Grades Trend</option>
              <option value="hours">Study Hours</option>
              <option value="modules">Module Comparison</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Current Average"
            value={`${summary.currentGrade}%`}
            change={summary.gradeChange}
            icon={BookOpen}
            color="primary"
          />
          <StatCard 
            title="Session Rating"
            value={`${summary.currentRating}/5`}
            change={summary.ratingChange}
            icon={Star}
            color="warning"
          />
          <StatCard 
            title="Total Hours"
            value={`${summary.totalHours}h`}
            change={summary.hoursChange}
            icon={Clock}
            color="info"
          />
          <StatCard 
            title="Attendance"
            value={`${summary.averageAttendance}%`}
            change={0}
            icon={Calendar}
            color="success"
          />
        </div>
      )}

      {/* Charts */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {activeChart === 'overview' && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Academic Performance Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="monthShort" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="grade"
                  orientation="left"
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <YAxis 
                  yAxisId="rating"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 5]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="grade"
                  dataKey="averageGrade" 
                  fill="rgba(99, 102, 241, 0.6)"
                  stroke="#6366f1"
                  name="Average Grade"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="rating"
                  type="monotone" 
                  dataKey="sessionRating" 
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Session Rating"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'grades' && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Grade Trends by Month</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="monthShort" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="averageGrade" 
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.3)"
                  strokeWidth={2}
                  name="Average Grade"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'hours' && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Study Hours & Sessions</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="monthShort" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="hours"
                  orientation="left"
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="sessions"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="hours"
                  dataKey="hoursStudied" 
                  fill="rgba(14, 165, 233, 0.6)"
                  name="Hours Studied"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="sessions"
                  type="monotone" 
                  dataKey="sessionsCompleted" 
                  stroke="#f97316"
                  strokeWidth={3}
                  name="Sessions Completed"
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'modules' && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Module Performance Comparison</h3>
            <div className="space-y-6">
              {moduleData.map((module, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{module.name}</h4>
                      <p className="text-sm text-muted-foreground">{module.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{module.currentGrade}%</span>
                      {module.trend === 'up' ? (
                        <TrendingUp size={16} className="text-success" />
                      ) : (
                        <TrendingDown size={16} className="text-destructive" />
                      )}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={module.data}>
                      <XAxis dataKey="month" hide />
                      <YAxis domain={[40, 100]} hide />
                      <Line 
                        type="monotone" 
                        dataKey="grade" 
                        stroke={module.color}
                        strokeWidth={3}
                        dot={{ fill: module.color, strokeWidth: 2, r: 3 }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                                <p className="text-xs font-medium">{label}: {payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}