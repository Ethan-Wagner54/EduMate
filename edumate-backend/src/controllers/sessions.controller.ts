import { Request, Response } from 'express';
import { PrismaClient, SessionStatus } from '@prisma/client';
import { logAudit } from '../utils/audit';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// A helper function to check for date overlaps
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export const listSessions = async (req: Request, res: Response) => {
  try {
    const { module: moduleCode, tutorId } = req.query as { module?: string; tutorId?: string };
    // Corrected to lowercase 'published'
    const where: any = { status: SessionStatus.published }; 

    if (moduleCode) {
      where.module = { code: moduleCode };
    }
    if (tutorId) {
      where.tutorId = Number(tutorId);
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        module: { select: { code: true, name: true } },
        tutor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return res.json(sessions);
  } catch (e) {
    logger.error('sessions_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to list sessions' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { moduleId, startTime, endTime, location, capacity } = req.body;

    if (!moduleId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sTime = new Date(startTime);
    const eTime = new Date(endTime);

    const existingSession = await prisma.session.findFirst({
        where: {
            tutorId: user.userId,
            startTime: { lt: eTime },
            endTime: { gt: sTime },
        }
    });

    if (existingSession) {
      return res.status(409).json({ error: 'Overlapping session exists for this tutor' });
    }

    const session = await prisma.session.create({
      data: {
        tutorId: user.userId,
        moduleId: Number(moduleId),
        startTime: sTime,
        endTime: eTime,
        location,
        capacity: capacity ? Number(capacity) : null,
        // Corrected to lowercase 'published'
        status: SessionStatus.published,
      },
    });

    res.status(201).json(session);
    await logAudit(user.userId, 'Session', session.id, 'CREATE');
  } catch (e) {
    logger.error('sessions_create_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to create session' });
  }
};

export const joinSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);
    const targetSession = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!targetSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const studentEnrollments = await prisma.enrollment.findMany({
        where: { studentId: user.userId, status: "joined" },
        include: { session: true }
    });

    const hasConflict = studentEnrollments.some(enrollment =>
        enrollment.sessionId !== sessionId && overlaps(targetSession.startTime, targetSession.endTime, enrollment.session.startTime, enrollment.session.endTime)
    );

    if (hasConflict) {
        return res.status(409).json({ error: 'You are already enrolled in a session at that time' });
    }

    const enrollmentCount = await prisma.enrollment.count({ where: { sessionId, status: 'joined' } });
    if (targetSession.capacity != null && enrollmentCount >= targetSession.capacity) {
      return res.status(409).json({ error: 'Session is full' });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { sessionId_studentId: { sessionId, studentId: user.userId } },
      update: { status: 'joined' },
      create: { sessionId, studentId: user.userId, status: 'joined' },
    });

    res.json({ ok: true });
    await logAudit(user.userId, 'Enrollment', enrollment.id, 'JOIN');
  } catch (e) {
    logger.error('sessions_join_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to join session' });
  }
};

export const leaveSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);

    const enrollment = await prisma.enrollment.update({
      where: { sessionId_studentId: { sessionId, studentId: user.userId } },
      data: { status: 'cancelled' },
    });

    res.json({ ok: true });
    await logAudit(user.userId, 'Enrollment', enrollment.id, 'LEAVE');
  } catch (e) {
    logger.error('sessions_leave_failed', { error: (e as any)?.message || String(e) });
    res.status(500).json({ error: 'Failed to leave session' });
  }
};
