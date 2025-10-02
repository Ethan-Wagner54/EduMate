import { Request, Response } from 'express';
import { PrismaClient, ConversationParticipant, Role, UserProfile } from '@prisma/client';
import { logger } from '../utils/logger';
import { formatTime, formatTimeAgo } from '../utils/formatDate'; // Assuming helpers are in this file

const prisma = new PrismaClient();

// This is the corrected type definition
type ParticipantWithUser = ConversationParticipant & {
  user: {
    id: number;
    name: string | null;
    role: Role;
    profile: {
      isOnline: boolean;
    } | null;
  };
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: {
                  select: { isOnline: true }
                }
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { sentAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find((p: ParticipantWithUser) => p.userId !== userId)?.user;
      const lastMessage = conv.messages[0];
      const unreadCount = conv.participants.find((p: ConversationParticipant) => p.userId === userId)?.unreadCount || 0;

      return {
        id: conv.id,
        name: conv.name || otherParticipant?.name || 'Conversation',
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage ? formatTimeAgo(lastMessage.sentAt) : '',
        unreadCount,
        isOnline: otherParticipant?.profile?.isOnline || false,
        userType: otherParticipant?.role || 'student'
      };
    });

    res.json(formattedConversations);
  } catch (e) {
    logger.error('conversations_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const participation = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId }
    });

    if (!participation) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      },
      orderBy: { sentAt: 'asc' }
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender.name,
      content: msg.content,
      timestamp: formatTime(msg.sentAt),
      isOwn: msg.senderId === userId
    }));

    res.json(formattedMessages);
  } catch (e) {
    logger.error('messages_get_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const participation = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId }
    });

    if (!participation) {
      return res.status(403).json({ error: 'Not authorized to send messages to this conversation' });
    }

    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: userId }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    const formattedMessage = {
      id: message.id,
      sender: message.sender.name,
      content: message.content,
      timestamp: formatTime(message.sentAt),
      isOwn: true
    };

    res.status(201).json(formattedMessage);
  } catch (e) {
    logger.error('message_send_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: {
                  select: { isOnline: true }
                }
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const otherParticipant = conversation.participants.find((p: ParticipantWithUser) => p.userId !== userId)?.user;

    const formattedConversation = {
      id: conversation.id,
      name: conversation.name || otherParticipant?.name || 'Conversation',
      isOnline: otherParticipant?.profile?.isOnline || false,
      userType: otherParticipant?.role || 'student'
    };

    res.json(formattedConversation);
  } catch (e) {
    logger.error('conversation_get_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get conversation' });
  }
};