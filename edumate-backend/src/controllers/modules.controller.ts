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