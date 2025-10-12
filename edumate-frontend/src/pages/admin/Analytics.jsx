import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, MessageSquare, BarChart3, PieChart as PieChartIcon, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import adminService from '../../services/admin/adminService';
import {
  processUserGrowthData,
  processSessionTrends,
  calculateAnalyticsSummary,
  formatPieChartData,
  getChartColors,
  formatNumber,
  formatPercentage
} from '../../utils/analyticsData';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [sessionTrendData, setSessionTrendData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [activeChart, setActiveChart] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const colors = getChartColors();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch comprehensive analytics data using the new method
        const response = await adminService.getAnalyticsData();
        
        if (response.success && response.data) {
          const data = response.data;
          setAnalyticsData(data);
          
          // Process data for different chart types
          const processedUserData = processUserGrowthData(data.usersByMonth);
          const processedSessionData = processSessionTrends(data.sessionsByMonth);
          const formattedPieData = formatPieChartData(data.sessionStatusDistribution);
          const summaryStats = calculateAnalyticsSummary(data);
          
          setUserGrowthData(processedUserData);
          setSessionTrendData(processedSessionData);
          setPieChartData(formattedPieData);
          setSummary(summaryStats);
        } else {
          setError(response.error || 'Failed to load analytics data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timePeriod]);

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatNumber(entry.value)}${entry.name.includes('Rate') || entry.name.includes('Growth') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stat card component
  const StatCard = ({ title, value, change, icon: Icon, color, suffix = '' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}{suffix}</div>
        <p className="text-xs text-gray-600">
          {change !== undefined && (
            <>
              {change > 0 ? (
                <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="inline h-3 w-3 text-red-600 mr-1" />
              ) : null}
              <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}>
                {formatPercentage(change)} from last month
              </span>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time system performance and usage statistics</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Period Filter */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <select 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
            
            {/* Chart Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select 
                value={activeChart} 
                onChange={(e) => setActiveChart(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="users">User Growth</option>
                <option value="sessions">Session Trends</option>
                <option value="distribution">Status Distribution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={summary.totalUsers}
              change={summary.userGrowth}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Total Sessions"
              value={summary.totalSessions}
              change={summary.sessionGrowth}
              icon={Calendar}
              color="green"
            />
            <StatCard
              title="Active Users"
              value={summary.activeUsers}
              change={summary.engagementRate}
              icon={TrendingUp}
              color="indigo"
              suffix={`/${summary.totalUsers}`}
            />
            <StatCard
              title="Completion Rate"
              value={summary.completionRate}
              icon={MessageSquare}
              color="purple"
              suffix="%"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              {activeChart === 'overview' && userGrowthData.length > 0 && sessionTrendData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="monthShort" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="users"
                        orientation="left"
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="growth"
                        orientation="right"
                        stroke="#64748b"
                        fontSize={12}
                        domain={[-10, 50]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="users"
                        dataKey="cumulativeUsers" 
                        fill={colors.primary}
                        name="Total Users"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="growth"
                        type="monotone" 
                        dataKey="userGrowth" 
                        stroke={colors.success}
                        strokeWidth={3}
                        name="Growth Rate (%)"
                        dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === 'users' && userGrowthData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth Trends</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="monthShort" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeUsers" 
                        stackId="1"
                        stroke={colors.primary}
                        fill={colors.primary}
                        fillOpacity={0.6}
                        name="Cumulative Users"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newUsers" 
                        stackId="2"
                        stroke={colors.success}
                        fill={colors.success}
                        fillOpacity={0.6}
                        name="New Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === 'sessions' && sessionTrendData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Session Activity Trends</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={sessionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="monthShort" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="sessions"
                        orientation="left"
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="rate"
                        orientation="right"
                        stroke="#64748b"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="sessions"
                        dataKey="totalSessions" 
                        fill={colors.info}
                        name="Total Sessions"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar 
                        yAxisId="sessions"
                        dataKey="completedSessions" 
                        fill={colors.success}
                        name="Completed Sessions"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="rate"
                        type="monotone" 
                        dataKey="completionRate" 
                        stroke={colors.warning}
                        strokeWidth={3}
                        name="Completion Rate (%)"
                        dot={{ fill: colors.warning, strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === 'distribution' && pieChartData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Session Status Distribution</h3>
                  <div className="flex flex-col lg:flex-row items-center">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                    <p className="font-medium" style={{ color: data.color }}>
                                      {data.name}: {data.value} ({data.percentage}%)
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-8">
                      <div className="space-y-4">
                        {pieChartData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.value}</div>
                              <div className="text-sm text-gray-600">{item.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Users</span>
                    <span className="font-semibold">{analyticsData.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <span className="font-semibold">{analyticsData.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement Rate</span>
                    <span className="font-semibold text-green-600">
                      {analyticsData.engagementMetrics?.engagementRate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sessions</span>
                    <span className="font-semibold">{analyticsData.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-semibold">{analyticsData.engagementMetrics?.completedSessions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-semibold text-green-600">
                      {analyticsData.engagementMetrics?.completionRate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status</span>
                    <span className="font-semibold text-green-600">Operational</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tutors</span>
                    <span className="font-semibold">{analyticsData.totalTutors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Students</span>
                    <span className="font-semibold">{analyticsData.totalStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}