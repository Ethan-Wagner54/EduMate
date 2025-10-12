import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getTutorDashboard = async (req: Request, res: Response) => {
  try {
    // Get the current user's ID from the JWT token
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    logger.info('tutor_dashboard_fetch_start', { userId });
    
    // Get tutor data with all related information
    const tutor = await prisma.user.findUnique({
      where: { 
        id: userId,
        role: 'tutor' // Ensure user is actually a tutor
      },
      include: {
        profile: true,
        tutorModules: {
          include: {
            module: true
          }
        },
        sessions: {
          include: {
            module: true,
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          },
          take: 10 // Get latest 10 sessions
        }
      }
    });
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found or user is not a tutor' });
    }
    
    // Calculate upcoming sessions (future sessions)
    const now = new Date();
    const upcomingSessions = await prisma.session.findMany({
      where: {
        tutorId: userId,
        startTime: {
          gte: now
        }
      },
      include: {
        module: true,
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5
    });
    
    // Build the dashboard response
    const dashboardData = {
      // Basic tutor information
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      phone: tutor.phone,
      role: tutor.role,
      
      // Profile information (from UserProfile table)
      bio: tutor.profile?.bio || 'Experienced educator dedicated to helping students succeed.',
      specialties: tutor.profile?.specialties || [],
      isOnline: tutor.profile?.isOnline || false,
      
      // Modules the tutor teaches (from TutorModule table)
      modules: tutor.tutorModules.map(tm => ({
        code: tm.module.code,
        name: tm.module.name,
        faculty: tm.module.faculty,
        approved: tm.approvedByAdmin
      })),
      
      // Statistics (from UserProfile table)
      stats: {
        totalSessions: tutor.profile?.totalSessions || 0,
        completedSessions: tutor.profile?.completedSessions || 0,
        averageRating: tutor.profile?.averageRating || 0,
        upcomingSessions: upcomingSessions.length
      },
      
      // Recent sessions
      recentSessions: tutor.sessions.map(session => ({
        id: session.id,
        title: `${session.module.code} - ${session.module.name}`,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        capacity: session.capacity,
        enrolledStudents: session.enrollments.length,
        status: session.status,
        students: session.enrollments.map(e => ({
          id: e.student.id,
          name: e.student.name
        }))
      })),
      
      // Upcoming sessions
      upcomingSessions: upcomingSessions.map(session => ({
        id: session.id,
        title: `${session.module.code} - ${session.module.name}`,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        capacity: session.capacity,
        enrolledStudents: session.enrollments.length,
        students: session.enrollments.map(e => ({
          id: e.student.id,
          name: e.student.name
        }))
      }))
    };
    
    logger.info('tutor_dashboard_fetch_success', { 
      userId, 
      modulesCount: dashboardData.modules.length,
      upcomingSessionsCount: dashboardData.upcomingSessions.length 
    });
    
    res.json(dashboardData);
    
  } catch (error) {
    logger.error('tutor_dashboard_fetch_failed', { 
      userId: req.user?.userId,
      error: (error as any)?.message || String(error) 
    });
    res.status(500).json({ message: 'Error fetching tutor dashboard data' });
  }
};