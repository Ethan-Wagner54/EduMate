import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logAudit } from '../utils/audit';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

function isTutorStudentPair(a: Role, b: Role) {
  const set = new Set([a, b]);
  return set.has('tutor') && set.has('student');
}

export async function sendMessage(req: Request, res: Response) {
  try {
    // Get the logged-in user's info from the protect middleware
    const user = req.user!; 
    const { recipientId, sessionId, content } = req.body as {
      recipientId: number;
      sessionId?: number;
      content: string;
    };

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'recipientId and content are required' });
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check that one user is a tutor and the other is a student
    if (!isTutorStudentPair(user.role as Role, recipient.role)) {
      return res.status(403).json({ error: 'Only tutor-student messages are allowed' });
    }

    const msg = await prisma.message.create({
      data: {
        senderId: user.userId, // Use userId from the token payload
        recipientId: recipient.id,
        sessionId: sessionId ?? null,
        content,
      },
    });

    res.status(201).json(msg);
    await logAudit(user.userId, 'Message', msg.id, 'SEND');

  } catch (e) {
    logger.error('message_send_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

// Renamed from listMyMessages to listMessages
export async function listMessages(req: Request, res: Response) {
  try {
    const user = req.user!;
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.userId }, { recipientId: user.userId }], // Use userId
      },
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { name: true } },
        recipient: { select: { name: true } },
      }
    });

    return res.json(messages);
  } catch (e) {
    logger.error('message_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to list messages' });
  }
}
