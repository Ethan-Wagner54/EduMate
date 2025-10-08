import axiosInstance from "../../config/axios";

class AdminService {
  // User Management
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllStudents() {
    try {
      const response = await axiosInstance.get('/admin/students');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllTutors() {
    try {
      const response = await axiosInstance.get('/admin/tutors');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPendingTutors() {
    try {
      const response = await axiosInstance.get('/admin/tutors/pending');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveTutor(tutorId: string) {
    try {
      const response = await axiosInstance.put(`/admin/tutors/${tutorId}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async rejectTutor(tutorId: string, reason?: string) {
    try {
      const response = await axiosInstance.put(`/admin/tutors/${tutorId}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deactivateUser(userId: string, userType: 'student' | 'tutor') {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/deactivate`, { userType });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async reactivateUser(userId: string, userType: 'student' | 'tutor') {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/reactivate`, { userType });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Session Management
  async getAllSessions() {
    try {
      const response = await axiosInstance.get('/admin/sessions');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateSession(sessionId: string, updates: any) {
    try {
      const response = await axiosInstance.put(`/admin/sessions/${sessionId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteSession(sessionId: string) {
    try {
      const response = await axiosInstance.delete(`/admin/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSessionDetails(sessionId: string) {
    try {
      const response = await axiosInstance.get(`/admin/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Chat Moderation
  async getAllChats() {
    try {
      const response = await axiosInstance.get('/admin/chats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFlaggedMessages() {
    try {
      const response = await axiosInstance.get('/admin/chats/flagged');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const response = await axiosInstance.delete(`/admin/messages/${messageId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async flagMessage(messageId: string, reason: string) {
    try {
      const response = await axiosInstance.put(`/admin/messages/${messageId}/flag`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unflagMessage(messageId: string) {
    try {
      const response = await axiosInstance.put(`/admin/messages/${messageId}/unflag`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async warnUser(userId: string, reason: string) {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/warn`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Analytics and Dashboard
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSystemHealth() {
    try {
      const response = await axiosInstance.get('/admin/system/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRecentActivity() {
    try {
      const response = await axiosInstance.get('/admin/activity/recent');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const adminService = new AdminService();
export default adminService;