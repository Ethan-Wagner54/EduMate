import axiosInstance from '../../config/axios';

class StudentTutorsService {
  /**
   * Get all tutors for the current student
   */
  async getMyTutors() {
    try {
      const response = await axiosInstance.get('/student-tutors');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tutors'
      };
    }
  }

  /**
   * Get detailed profile of a specific tutor
   */
  async getTutorProfile(tutorId) {
    try {
      const response = await axiosInstance.get(`/student-tutors/${tutorId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tutor profile'
      };
    }
  }

  /**
   * Rate a tutor
   */
  async rateTutor(tutorId, rating) {
    try {
      const response = await axiosInstance.post(`/student-tutors/${tutorId}/rate`, {
        rating
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to rate tutor'
      };
    }
  }

  /**
   * Format tutor data for display
   */
  formatTutorForDisplay(tutorData) {
    return {
      id: tutorData.tutorId,
      name: tutorData.name,
      email: tutorData.email,
      bio: tutorData.bio,
      profilePicture: tutorData.profilePicture,
      rating: tutorData.averageRating ? parseFloat(tutorData.averageRating.toFixed(1)) : 0,
      totalSessions: tutorData.totalSessions || 0,
      isOnline: tutorData.isOnline,
      lastSeen: tutorData.lastSeen,
      
      // Relationship-specific data
      firstSessionDate: tutorData.firstSessionDate,
      lastSessionDate: tutorData.lastSessionDate,
      totalSessionsTogether: tutorData.totalSessionsTogether,
      myRating: tutorData.averageRatingGiven,
      
      // Formatted data
      modules: tutorData.modules || [],
      specialties: tutorData.specialties || [],
      
      // For compatibility with existing UI
      completedSessions: tutorData.totalSessionsTogether || 0,
      nextSession: null // TODO: Calculate next session if available
    };
  }
}

// Create singleton instance
const studentTutorsService = new StudentTutorsService();

export default studentTutorsService;