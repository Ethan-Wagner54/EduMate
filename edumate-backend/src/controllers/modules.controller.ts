import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getModules = async (req: Request, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        faculty: true,
      },
    });
    return res.json(modules);
  } catch (e) {
    logger.error('modules_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to list modules' });
  }
};

export const getTutorModules = async (req: Request, res: Response) => {
  try {
    const tutorId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    
    if (!tutorId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (userRole !== 'tutor') {
      return res.status(403).json({ error: 'Access denied. Only tutors can access this resource.' });
    }

    const tutorModules = await prisma.tutorModule.findMany({
      where: {
        tutorId: tutorId,
        approvedByAdmin: true
      },
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true,
            faculty: true,
          }
        }
      },
      orderBy: {
        module: {
          code: 'asc'
        }
      }
    });

    // Extract just the module data
    const modules = tutorModules.map(tm => tm.module);
    
    return res.json(modules);
  } catch (e) {
    logger.error('tutor_modules_list_failed', { error: (e as any)?.message || String(e), tutorId: (req as any).user?.userId });
    return res.status(500).json({ error: 'Failed to list tutor modules' });
  }
};

// Debug endpoint - remove in production
export const debugTutorModules = async (req: Request, res: Response) => {
  try {
    const tutorId = (req as any).user?.userId;
    
    if (!tutorId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tutorModules = await prisma.tutorModule.findMany({
      where: {
        tutorId: tutorId
      },
      include: {
        module: true
      }
    });

    return res.json({
      tutorId,
      tutorModules
    });
  } catch (e) {
    logger.error('debug_tutor_modules_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get tutor modules debug info' });
  }
};
