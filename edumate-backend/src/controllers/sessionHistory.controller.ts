import { Request, Response } from 'express';
import { PrismaClient, TutorModule, Module } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Helper function
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, sortBy } = req.query as { status?: string; sortBy?: string };

    let whereClause: any = {
      studentId: userId
    };

    if (status && status !== 'all') {
      if (status === 'completed') {
        whereClause.session = {
          endTime: { lt: new Date() }
        };
      } else if (status === 'cancelled') {
        whereClause.status = 'cancelled';
      }
    }

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        session: {
          include: {
            module: { select: { code: true, name: true } },
            tutor: { select: { id: true, name: true } },
            reviews: {
              where: { studentId: userId },
              select: { rating: true, feedback: true }
            }
          }
        }
      },
      orderBy: sortBy === 'date' ? { session: { startTime: 'desc' } } :
               sortBy === 'module' ? { session: { module: { name: 'asc' } } } :
               { session: { startTime: 'desc' } }
    });

    const sessions = enrollments.map(enrollment => {
      const session = enrollment.session;
      const review = session.reviews[0];
      const now = new Date();
      const endTime = new Date(session.endTime);
      const startTime = new Date(session.startTime);

      let sessionStatus = 'scheduled';
      if (enrollment.status === 'cancelled') {
        sessionStatus = 'cancelled';
      } else if (endTime < now) {
        sessionStatus = 'completed';
      } else if (startTime < now) {
        sessionStatus = 'in-progress';
      }

      return {
        id: session.id,
        module: session.module,
        tutor: session.tutor,
        date: session.startTime.toISOString().split('T')[0],
        startTime: formatTime(session.startTime),
        endTime: formatTime(session.endTime),
        location: session.location,
        status: sessionStatus,
        rating: review?.rating || null,
        feedback: review?.feedback || null,
        attendance: enrollment.status === 'cancelled' ? 'absent' : 'present'
      };
    });

    res.json(sessions);
  } catch (e) {
    logger.error('session_history_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get session history' });
  }
};

export const submitSessionReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionId = parseInt(req.params.sessionId);
    const { rating, feedback } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        sessionId,
        studentId: userId,
        status: 'joined'
      },
      include: {
        session: true
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not authorized to review this session' });
    }

    if (new Date(enrollment.session.endTime) > new Date()) {
      return res.status(400).json({ error: 'Cannot review a session that hasn\'t ended yet' });
    }

    const review = await prisma.sessionReview.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: userId
        }
      },
      update: {
        rating: parseInt(rating),
        feedback
      },
      create: {
        sessionId,
        studentId: userId,
        rating: parseInt(rating),
        feedback
      }
    });

    res.json(review);
  } catch (e) {
    logger.error('session_review_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getTutorSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tutorId = parseInt(req.params.tutorId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // --- THIS IS THE FIX ---
    // Correctly include the 'profile' and 'tutorModules' relations
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      include: {
        profile: true, // Include the full profile
        tutorModules: {
          include: {
            module: { select: { code: true, name: true } }
          }
        }
      }
    });

    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const sessions = await prisma.session.findMany({
      where: { tutorId },
      include: {
        module: { select: { code: true, name: true } },
        tutor: { select: { id: true, name: true } },
        enrollments: {
          where: { status: 'joined' },
          select: { id: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const formattedTutor = {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      // Add type annotation to fix the implicit 'any' error
      modules: tutor.tutorModules.map((tm: TutorModule & { module: { code: string } }) => tm.module.code),
      rating: tutor.profile?.averageRating || 0,
      totalSessions: tutor.profile?.totalSessions || 0,
      completedSessions: tutor.profile?.completedSessions || 0,
      specialties: tutor.profile?.specialties || []
    };

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      module: session.module,
      tutor: session.tutor,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      capacity: session.capacity,
      enrolled: session.enrollments.length,
      status: session.status,
      description: `Session on ${session.module.name}`
    }));

    res.json({
      tutor: formattedTutor,
      sessions: formattedSessions
    });
  } catch (e) {
    logger.error('tutor_sessions_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get tutor sessions' });
  }
};