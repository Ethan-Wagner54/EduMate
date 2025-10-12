import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { countUpcomingSessions, countCompletedSessions } from '../utils/sessionHelpers';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Always calculate dashboard stats in real-time using consistent helper functions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          where: { 
            status: 'joined',
            session: {
              status: 'published'  // Only include published sessions
            }
          },
          include: { session: { include: { module: true, tutor: true } } }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Use helper functions for consistent session counting
    const upcomingSessions = await countUpcomingSessions(userId);
    const completedSessions = await countCompletedSessions(userId);

    // Calculate other stats from user data
    const activeTutors = new Set(user.enrollments.map(e => e.session.tutorId)).size;
    const sessionsThisMonth = user.enrollments.filter(e => 
      new Date(e.joinedAt) >= thisMonth
    ).length;
    
    // Debug logging for dashboard stats
    logger.info('dashboard_stats_debug', {
      userId,
      totalEnrollments: user.enrollments.length,
      upcomingSessionsCount: upcomingSessions,
      completedSessionsCount: completedSessions,
      activeTutorsCount: activeTutors,
      sessionsThisMonthCount: sessionsThisMonth
    });

    // Get reviews for average rating
    const reviews = await prisma.sessionReview.findMany({
      where: { studentId: userId },
      select: { rating: true }
    });
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    const calculatedStats = {
      activeTutors,
      sessionsThisMonth,
      upcomingSessions,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSessions: user.enrollments.length,
      completedSessions,
      // Add user information for welcome message
      user: {
        name: user.name,
        firstName: user.name.split(' ')[0],
        role: user.role
      }
    };

    return res.json(calculatedStats);
  } catch (e) {
    logger.error('dashboard_stats_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Since we don't have a comprehensive activity tracking system yet,
    // generate synthetic activities based on user's enrollments and sessions
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'joined'
      },
      include: {
        session: {
          include: {
            module: { select: { code: true, name: true } },
            tutor: { select: { name: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      take: 5
    });

    // Get recent messages (if any)
    const recentMessages = await prisma.conversationMessage.findMany({
      where: {
        senderId: userId
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: { not: userId }
              },
              include: {
                user: { select: { name: true, role: true } }
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 3
    });

    const now = new Date();
    const activities: any[] = [];

    // Add enrollment activities
    enrollments.forEach((enrollment) => {
      const session = enrollment.session;
      const isUpcoming = new Date(session.startTime) > now;
      const isCompleted = new Date(session.endTime) < now;
      
      if (isCompleted) {
        activities.push({
          id: `session_completed_${enrollment.id}`,
          type: 'session_completed',
          description: `Completed ${session.module.name} session with ${session.tutor.name}`,
          createdAt: session.endTime,
        });
      } else if (isUpcoming) {
        activities.push({
          id: `session_enrolled_${enrollment.id}`,
          type: 'session_enrolled',
          description: `Enrolled in ${session.module.name} session with ${session.tutor.name}`,
          createdAt: enrollment.joinedAt,
        });
      }
    });

    // Add message activities
    recentMessages.forEach((message, index) => {
      const recipient = message.conversation.participants[0]?.user;
      if (recipient) {
        const recipientType = recipient.role === 'tutor' ? 'tutor' : 'student';
        activities.push({
          id: `message_sent_${message.id}`,
          type: 'message_sent',
          description: `Sent message to ${recipient.name} (${recipientType})`,
          createdAt: message.sentAt,
        });
      }
    });

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return top 8 activities
    res.json(activities.slice(0, 8));
  } catch (e) {
    logger.error('dashboard_activities_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get activities' });
  }
};

export const getUpcomingSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get upcoming sessions with consistent filtering
    const now = new Date();
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'joined',
        session: {
          startTime: { gte: now },
          status: 'published'  // Only include published sessions
        }
      },
      include: {
        session: {
          include: {
            module: { select: { code: true, name: true } },
            tutor: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: {
        session: { startTime: 'asc' }
      },
      take: 5
    });
    
    const sessions = enrollments.map(enrollment => enrollment.session);
    
    // Debug logging
    logger.info('getUpcomingSessions_debug', {
      userId,
      sessionCount: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        startTime: s.startTime,
        moduleCode: s.module.code,
        status: s.status
      }))
    });
    
    res.json(sessions);
  } catch (e) {
    logger.error('dashboard_upcoming_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get upcoming sessions' });
  }
};

export const getTutorProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all tutors the student has sessions with
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'joined'
      },
      include: {
        session: {
          include: {
            module: { select: { code: true, name: true } },
            tutor: { 
              select: { 
                id: true, 
                name: true,
                profile: {
                  select: { averageRating: true }
                }
              } 
            }
          }
        }
      }
    });

    // Group by tutor and calculate progress
    const tutorStats = enrollments.reduce((acc, enrollment) => {
      const tutorId = enrollment.session.tutorId;
      const tutorName = enrollment.session.tutor.name;
      const subject = enrollment.session.module.code;
      const rating = enrollment.session.tutor.profile?.averageRating || 0;

      if (!acc[tutorId]) {
        acc[tutorId] = {
          name: tutorName,
          subject,
          sessions: 0,
          rating,
          progress: 0,
          initials: tutorName.split(' ').map(n => n[0]).join('')
        };
      }

      acc[tutorId].sessions++;

      // Calculate progress based on completed sessions (mock calculation)
      const now = new Date();
      if (new Date(enrollment.session.endTime) < now) {
        acc[tutorId].progress = Math.min(acc[tutorId].progress + 10, 100);
      }

      return acc;
    }, {} as any);

    const progressArray = Object.values(tutorStats);
    res.json(progressArray);
  } catch (e) {
    logger.error('dashboard_progress_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get tutor progress' });
  }
};