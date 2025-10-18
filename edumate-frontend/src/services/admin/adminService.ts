import axiosInstance from "../../config/axios";

class AdminService {
  // User Management
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getAllStudents() {
    try {
      const response = await axiosInstance.get('/admin/users');
      const data = Array.isArray(response.data) ? response.data.filter((u: any) => u.role === 'student') : [];
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getAllTutors() {
    try {
      const response = await axiosInstance.get('/admin/users');
      const data = Array.isArray(response.data) ? response.data.filter((u: any) => u.role === 'tutor' && (u.isActive !== false)) : [];
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getPendingTutors() {
    try {
      const response = await axiosInstance.get('/admin/tutor-requests');
      const data = Array.isArray(response.data)
        ? response.data.map((tm: any) => ({
            id: tm.id, // tutor-module request id used for approval/rejection
            name: tm.tutor?.name || 'Unknown',
            email: tm.tutor?.email || 'Unknown',
            createdAt: tm.createdAt,
            status: 'pending',
          }))
        : [];
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async approveTutor(tutorRequestId: string) {
    try {
      const response = await axiosInstance.post(`/admin/tutor-requests/${tutorRequestId}/approve`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async rejectTutor(tutorRequestId: string, reason?: string) {
    try {
      const response = await axiosInstance.post(`/admin/tutor-requests/${tutorRequestId}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async deactivateUser(userId: string, userType: 'student' | 'tutor') {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/deactivate`, { userType });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async reactivateUser(userId: string, userType: 'student' | 'tutor') {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/reactivate`, { userType });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  // Session Management
  async getAllSessions() {
    try {
      const response = await axiosInstance.get('/admin/sessions');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Fallback to public sessions list if admin endpoint not available
      if (error?.response?.status === 404) {
        try {
          const resp = await axiosInstance.get('/sessions');
          const now = new Date();
          const mapped = (Array.isArray(resp.data) ? resp.data : []).map((s: any) => ({
            id: s.id,
            title: s.title,
            subject: s.module?.name || s.module?.code || s.course || 'N/A',
            tutorName: s.tutor,
            scheduledAt: s.startTime,
            location: s.location || 'Online',
            participants: Array.from({ length: Number(s.enrolledCount || 0) }),
            status: s.status === 'cancelled'
              ? 'cancelled'
              : (s.endTime && new Date(s.endTime) < now)
                ? 'completed'
                : (new Date(s.startTime) > now)
                  ? 'scheduled'
                  : 'active',
            description: s.description || null,
          }));
          return { success: true, data: mapped };
        } catch (fallbackErr: any) {
          return { success: false, error: fallbackErr?.response?.data?.message || fallbackErr?.message || 'Request failed' };
        }
      }
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async updateSession(sessionId: string, updates: any) {
    console.log('AdminService.updateSession called:', { sessionId, updates });
    
    try {
      console.log('Attempting admin endpoint: /admin/sessions/' + sessionId);
      const response = await axiosInstance.put(`/admin/sessions/${sessionId}`, updates);
      console.log('Admin endpoint response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log('Admin endpoint failed:', error?.response?.status, error?.response?.data);
      
      if (error?.response?.status === 404) {
        try {
          console.log('Trying fallback endpoint: /sessions/' + sessionId);
          const resp = await axiosInstance.put(`/sessions/${sessionId}`, updates);
          console.log('Fallback endpoint response:', resp.data);
          return { success: true, data: resp.data };
        } catch (fallbackErr: any) {
          console.log('Fallback endpoint failed:', fallbackErr?.response?.status, fallbackErr?.response?.data);
          return { success: false, error: fallbackErr?.response?.data?.message || fallbackErr?.message || 'Request failed' };
        }
      }
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async deleteSession(sessionId: string) {
    try {
      const response = await axiosInstance.delete(`/admin/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        try {
          const resp = await axiosInstance.delete(`/sessions/${sessionId}`);
          return { success: true, data: resp.data };
        } catch (fallbackErr: any) {
          return { success: false, error: fallbackErr?.response?.data?.message || fallbackErr?.message || 'Request failed' };
        }
      }
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getSessionDetails(sessionId: string) {
    try {
      const response = await axiosInstance.get(`/admin/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        try {
          const resp = await axiosInstance.get(`/sessions/${sessionId}`);
          const s = resp.data || {};
          const now = new Date();
          const mapped = {
            id: s.id,
            title: s.title,
            subject: s.module?.name || s.module?.code || s.course || 'N/A',
            tutorName: s.tutor,
            scheduledAt: s.startTime,
            location: s.location || 'Online',
            participants: Array.from({ length: Number(s.enrolledCount || 0) }),
            status: s.status === 'cancelled'
              ? 'cancelled'
              : (s.endTime && new Date(s.endTime) < now)
                ? 'completed'
                : (new Date(s.startTime) > now)
                  ? 'scheduled'
                  : 'active',
            description: s.description || null,
          };
          return { success: true, data: mapped };
        } catch (fallbackErr: any) {
          return { success: false, error: fallbackErr?.response?.data?.message || fallbackErr?.message || 'Request failed' };
        }
      }
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  // Chat Moderation (not yet implemented on backend)
  async getAllChats() {
    try {
      const response = await axiosInstance.get('/admin/chats');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getFlaggedMessages() {
    try {
      const response = await axiosInstance.get('/admin/chats/flagged');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const response = await axiosInstance.delete(`/admin/messages/${messageId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async flagMessage(messageId: string, reason: string) {
    try {
      const response = await axiosInstance.put(`/admin/messages/${messageId}/flag`, { reason });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async unflagMessage(messageId: string) {
    try {
      const response = await axiosInstance.put(`/admin/messages/${messageId}/unflag`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async warnUser(userId: string, reason: string) {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/warn`, { reason });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  // Analytics and Dashboard
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getAnalyticsData() {
    try {
      // Fetch comprehensive analytics data
      const [usersRes, sessionsRes, studentsRes] = await Promise.all([
        this.getAllUsers(),
        this.getAllSessions(),
        this.getAllStudents()
      ]);

      const users = usersRes.success ? usersRes.data : [];
      const sessions = sessionsRes.success ? sessionsRes.data : [];
      const students = studentsRes.success ? studentsRes.data : [];
      const tutors = users.filter((u: any) => u.role === 'tutor');

      // Calculate time-based data
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      // Process users by month for growth chart
      const usersByMonth = this.groupUsersByMonth(users, 6);
      const sessionsByMonth = this.groupSessionsByMonth(sessions, 6);
      
      // Calculate session status distribution
      const sessionStatusDistribution = this.calculateSessionStatusDistribution(sessions);
      
      // Calculate user engagement metrics
      const engagementMetrics = this.calculateEngagementMetrics(users, sessions);

      return {
        success: true,
        data: {
          usersByMonth,
          sessionsByMonth,
          sessionStatusDistribution,
          engagementMetrics,
          totalUsers: users.length,
          totalStudents: students.length,
          totalTutors: tutors.length,
          totalSessions: sessions.length,
          activeUsers: users.filter((u: any) => u.isActive !== false).length
        }
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to fetch analytics data' };
    }
  }

  private groupUsersByMonth(users: any[], months: number) {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const usersInMonth = users.filter((user: any) => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate >= date && userDate < nextDate;
      });
      
      const tutorsInMonth = usersInMonth.filter((u: any) => u.role === 'tutor');
      const studentsInMonth = usersInMonth.filter((u: any) => u.role === 'student');
      
      result.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
        totalUsers: usersInMonth.length,
        tutors: tutorsInMonth.length,
        students: studentsInMonth.length,
        cumulativeUsers: users.filter((u: any) => {
          if (!u.createdAt) return false;
          return new Date(u.createdAt) < nextDate;
        }).length
      });
    }
    
    return result;
  }
  
  private groupSessionsByMonth(sessions: any[], months: number) {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const sessionsInMonth = sessions.filter((session: any) => {
        if (!session.scheduledAt && !session.startTime) return false;
        const sessionDate = new Date(session.scheduledAt || session.startTime);
        return sessionDate >= date && sessionDate < nextDate;
      });
      
      const completedSessions = sessionsInMonth.filter((s: any) => s.status === 'completed');
      const cancelledSessions = sessionsInMonth.filter((s: any) => s.status === 'cancelled');
      
      result.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
        totalSessions: sessionsInMonth.length,
        completedSessions: completedSessions.length,
        cancelledSessions: cancelledSessions.length,
        activeStatus: sessionsInMonth.length - completedSessions.length - cancelledSessions.length
      });
    }
    
    return result;
  }
  
  private calculateSessionStatusDistribution(sessions: any[]) {
    const statusCounts = {
      completed: 0,
      cancelled: 0,
      scheduled: 0,
      active: 0
    };
    
    sessions.forEach((session: any) => {
      const status = session.status || 'scheduled';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status as keyof typeof statusCounts]++;
      } else {
        statusCounts.scheduled++; // default fallback
      }
    });
    
    return [
      { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
      { name: 'Scheduled', value: statusCounts.scheduled, color: '#3b82f6' },
      { name: 'Active', value: statusCounts.active, color: '#f59e0b' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
    ];
  }
  
  private calculateEngagementMetrics(users: any[], sessions: any[]) {
    const activeUsers = users.filter((u: any) => u.isActive !== false).length;
    const totalUsers = users.length;
    const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    
    const completedSessions = sessions.filter((s: any) => s.status === 'completed').length;
    const totalSessions = sessions.length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    return {
      engagementRate,
      completionRate,
      activeUsers,
      totalUsers,
      completedSessions,
      totalSessions
    };
  }

  async getSystemHealth() {
    try {
      const response = await axiosInstance.get('/admin/system/health');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }

  async getRecentActivity() {
    try {
      const response = await axiosInstance.get('/admin/activity/recent');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
  }
}

const adminService = new AdminService();
export default adminService;
