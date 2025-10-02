import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await prisma.dashboardStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            where: { status: 'joined' },
            include: { session: { include: { module: true, tutor: true } } }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const activeTutors = new Set(user.enrollments.map(e => e.session.tutorId)).size;
      const sessionsThisMonth = user.enrollments.filter(e =>
        new Date(e.joinedAt) >= thisMonth
      ).length;
      const upcomingSessions = user.enrollments.filter(e =>
        new Date(e.session.startTime) > now
      ).length;

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
        completedSessions: user.enrollments.filter(e =>
          new Date(e.session.endTime) < now
        ).length
      };

      return res.json(calculatedStats);
    }

    res.json(stats);
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

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(activities);
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

    const now = new Date();
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'joined',
        session: {
          startTime: { gte: now }
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
          // --- THIS IS THE FIX ---
          // Check if tutorName exists before trying to split it
          initials: tutorName ? tutorName.split(' ').map(n => n[0]).join('') : 'NA'
        };
      }

      acc[tutorId].sessions++;
      
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