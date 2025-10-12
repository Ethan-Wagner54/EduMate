import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

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

    // Filter out invalid self-conversations (shouldn't happen, but defensive)
    const currentId = Number(userId);
    const validConversations = conversations.filter(conv => {
      if (conv.type !== 'direct') return true; // allow groups
      // Only include direct conversations with exactly 2 distinct users
      const ids = Array.from(new Set(conv.participants.map(p => Number(p.userId))));
      return ids.length === 2 && ids.includes(currentId);
    });

    // Format conversations for frontend
    const formattedConversations = validConversations.map(conv => {
      const other = conv.participants.find(p => Number(p.userId) !== currentId)?.user;
      const lastMessage = conv.messages[0];
      const unreadCount = conv.participants.find(p => Number(p.userId) === currentId)?.unreadCount || 0;

      return {
        id: conv.id,
        type: conv.type, // Include conversation type
        name: conv.name || other?.name || 'Conversation',
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage ? formatTimeAgo(lastMessage.sentAt) : '',
        unreadCount,
        isOnline: other?.profile?.isOnline || false,
        userType: other?.role || 'student',
        userId: other?.id || null, // Include other participant's user ID for private messaging
        isGroup: conv.isGroup, // Include isGroup flag
        participantCount: conv.participants.length // Include participant count
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

    // Check if user is participant in conversation
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
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

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.sender.name,
      content: msg.content,
      attachments: (msg as any).metadata?.attachments || [],
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

    // Check if user is participant in conversation
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
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

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Update unread counts for other participants
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

    const otherParticipant = conversation.participants.find(p => p.userId !== userId)?.user;

    const formattedConversation = {
      id: conversation.id,
      name: conversation.name || otherParticipant?.name || 'Conversation',
      isOnline: otherParticipant?.profile?.isOnline || false,
      userType: otherParticipant?.role || 'student',
      userId: otherParticipant?.id || null // Include other participant's user ID
    };

    res.json(formattedConversation);
  } catch (e) {
    logger.error('conversation_get_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get conversation' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    
    // Check if user is participant in conversation
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: parseInt(conversationId),
        userId
      }
    });
    
    if (!participation) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }
    
    // Update the participant's unread count and last read time
    await prisma.conversationParticipant.update({
      where: {
        id: participation.id
      },
      data: {
        unreadCount: 0,
        lastRead: new Date()
      }
    });
    
    res.json({ success: true });
  } catch (e) {
    logger.error('mark_as_read_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { participantId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!participantId) {
      return res.status(400).json({ error: 'participantId is required' });
    }

    if (participantId === userId) {
      return res.status(400).json({ error: 'Cannot create a conversation with yourself' });
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          {
            participants: {
              some: { userId }
            }
          },
          {
            participants: {
              some: { userId: participantId }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    // Additional validation: ensure exactly 2 participants and they match sender/recipient
    if (conversation) {
      const participantIds = conversation.participants.map(p => p.userId).sort();
      const expectedIds = [userId, participantId].sort();
      
      // If participants don't match exactly, treat as no conversation found
      if (participantIds.length !== 2 || 
          participantIds[0] !== expectedIds[0] || 
          participantIds[1] !== expectedIds[1]) {
        conversation = null;
      }
    }

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          type: 'direct',
          isGroup: false,
          participants: {
            create: [
              {
                userId,
                joinedAt: new Date(),
                unreadCount: 0
              },
              {
                userId: participantId,
                joinedAt: new Date(),
                unreadCount: 0
              }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          }
        }
      });
    }

    const otherParticipant = conversation.participants.find(p => p.userId !== userId)?.user;

    const formattedConversation = {
      id: conversation.id,
      name: conversation.name || otherParticipant?.name || 'Conversation',
      isOnline: false, // We'll implement online status later
      userType: otherParticipant?.role || 'student',
      userId: otherParticipant?.id || null // Include other participant's user ID
    };

    res.status(conversation.id === conversation.id ? 200 : 201).json(formattedConversation);
  } catch (e) {
    logger.error('conversation_create_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}