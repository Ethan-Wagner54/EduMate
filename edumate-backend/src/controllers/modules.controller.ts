import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const listModules = async (req: Request, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(modules);
  } catch (e) {
    console.error("--- MODULES_LIST_FAILED ---", e); // This will show the error
    logger.error('modules_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to list modules' });
  }
};