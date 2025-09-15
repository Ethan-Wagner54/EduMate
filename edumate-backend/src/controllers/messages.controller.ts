import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logAudit } from '../utils/audit';

const prisma = new PrismaClient();

function isTutorStudentPair(a: Role, b: Role) {
  const set = new Set([a, b]);
  return set.has('tutor') && set.has('student');
}

export async function sendMessage(req: Request, res: Response) {
  try {
    // Get the logged-in user's info from the protect middleware
    const user = req.user!; 
    console.log('Send Message Request',req)
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
      console.error('Only tutor-student messages are allowed')
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
    console.log('Message Saved',msg)

    res.status(201).json(msg);
    await logAudit(user.userId, 'Message', msg.id, 'SEND');

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

// Renamed from listMyMessages to listMessages
export async function listMessages(req: Request, res: Response) {
  try {
    console.log('List Messages Request',req)
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
    console.log('List Messages Length',messages.length)
    return res.json(messages);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list messages' });
  }
}