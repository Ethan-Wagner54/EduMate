import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();


export const getUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Valid ID is required' });
    }

    const user = await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    logger.error('user_get_user_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error fetching user' });
  }
};
