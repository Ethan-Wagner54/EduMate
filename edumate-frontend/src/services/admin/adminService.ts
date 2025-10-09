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
    try {
      const response = await axiosInstance.put(`/admin/sessions/${sessionId}`, updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        try {
          const resp = await axiosInstance.put(`/sessions/${sessionId}`, updates);
          return { success: true, data: resp.data };
        } catch (fallbackErr: any) {
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

  // Analytics and Dashboard (not yet implemented on backend)
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || error?.message || 'Request failed' };
    }
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
