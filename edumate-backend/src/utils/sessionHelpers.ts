import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StudentSessionQueryOptions {
  userId: number;
  includeCompleted?: boolean;
  includeUpcoming?: boolean;
  limit?: number;
}

/**
 * Get student enrollments with consistent filtering across all endpoints
 */
export const getStudentEnrollments = async (options: StudentSessionQueryOptions) => {
  const { userId, includeCompleted = true, includeUpcoming = true, limit } = options;
  
  const now = new Date();
  const whereConditions: any = {
    studentId: userId,
    status: 'joined',  // Only include currently enrolled students (not those who left)
    session: {
      status: 'published'  // Only include published sessions (not cancelled by tutor)
    }
  };

  // Add time-based filtering if specified
  if (!includeCompleted && !includeUpcoming) {
    throw new Error('Must include either completed or upcoming sessions');
  }

  if (!includeCompleted) {
    // Only upcoming sessions
    whereConditions.session.startTime = { gt: now };
  } else if (!includeUpcoming) {
    // Only completed sessions
    whereConditions.session.endTime = { lt: now };
  }
  // If both are true, include all sessions (no additional time filter)

  const queryOptions: any = {
    where: whereConditions,
    include: {
      session: {
        include: {
          module: { select: { code: true, name: true } },
          tutor: {
            select: {
              id: true,
              name: true,
              profile: { select: { averageRating: true } }
            }
          },
          _count: { select: { enrollments: true } }
        }
      }
    },
    orderBy: { session: { startTime: 'asc' } }
  };

  if (limit) {
    queryOptions.take = limit;
  }

  return await prisma.enrollment.findMany(queryOptions);
};

/**
 * Count upcoming sessions for a student
 */
export const countUpcomingSessions = async (userId: number): Promise<number> => {
  const enrollments = await getStudentEnrollments({
    userId,
    includeCompleted: false,
    includeUpcoming: true
  });
  
  return enrollments.length;
};

/**
 * Count completed sessions for a student
 */
export const countCompletedSessions = async (userId: number): Promise<number> => {
  const enrollments = await getStudentEnrollments({
    userId,
    includeCompleted: true,
    includeUpcoming: false
  });
  
  return enrollments.length;
};

/**
 * Get all sessions for a student (for My Sessions page)
 */
export const getAllStudentSessions = async (userId: number) => {
  return await getStudentEnrollments({
    userId,
    includeCompleted: true,
    includeUpcoming: true
  });
};

/**
 * Get upcoming sessions for dashboard display
 */
export const getUpcomingSessionsForDashboard = async (userId: number, limit: number = 5) => {
  return await getStudentEnrollments({
    userId,
    includeCompleted: false,
    includeUpcoming: true,
    limit
  });
};

/**
 * Get sessions that a student has left
 */
export const getLeftSessions = async (userId: number) => {
  const now = new Date();
  return await prisma.enrollment.findMany({
    where: {
      studentId: userId,
      status: 'left'
    },
    include: {
      session: {
        include: {
          module: { select: { code: true, name: true } },
          tutor: {
            select: {
              id: true,
              name: true,
              profile: { select: { averageRating: true } }
            }
          },
          _count: { select: { enrollments: true } }
        }
      }
    },
    orderBy: { leftAt: 'desc' }
  });
};

/**
 * Get sessions that a tutor has cancelled
 */
export const getCancelledSessionsByTutor = async (tutorId: number) => {
  return await prisma.session.findMany({
    where: {
      tutorId,
      status: 'cancelled'
    },
    include: {
      module: { select: { code: true, name: true } },
      tutor: {
        select: {
          id: true,
          name: true,
          profile: { select: { averageRating: true } }
        }
      },
      _count: { select: { enrollments: true } },
      enrollments: {
        where: { status: 'joined' },
        include: { student: { select: { name: true } } }
      }
    },
    orderBy: { cancelledAt: 'desc' }
  });
};

/**
 * Get sessions cancelled by tutors that affected a specific student
 */
export const getCancelledSessionsForStudent = async (studentId: number) => {
  return await prisma.enrollment.findMany({
    where: {
      studentId,
      session: {
        status: 'cancelled'
      }
    },
    include: {
      session: {
        include: {
          module: { select: { code: true, name: true } },
          tutor: {
            select: {
              id: true,
              name: true,
              profile: { select: { averageRating: true } }
            }
          },
          _count: { select: { enrollments: true } }
        }
      }
    },
    orderBy: { session: { cancelledAt: 'desc' } }
  });
};
