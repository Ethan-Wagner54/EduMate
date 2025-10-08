import { Request, Response } from 'express';
import { PrismaClient, ConversationType } from '@prisma/client';

// Extend the Request interface to include user from auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

const prisma = new PrismaClient();

/**
 * Get all group chats for the current user
 */
export const getGroupChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        },
        type: {
          in: ['group', 'session_chat']
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
                  select: {
                    profilePicture: true,
                    isOnline: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: userId
          }
        },
        type: {
          in: ['group', 'session_chat']
        }
      }
    });

    // Format response
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const userParticipant = conv.participants.find(p => p.userId === userId);
        
        // Get session details if it's a session chat
        let session = null;
        if (conv.type === 'session_chat') {
          // Try to find session from conversation name pattern or participants
          // For session chats, we can try to extract session info from existing enrollments
          const tutorParticipant = conv.participants.find(p => p.user.role === 'tutor');
          if (tutorParticipant) {
            // Find a session where this tutor is teaching and has enrolled students from this conversation
            const studentIds = conv.participants.filter(p => p.user.role === 'student').map(p => p.userId);
            if (studentIds.length > 0) {
              session = await prisma.session.findFirst({
                where: {
                  tutorId: tutorParticipant.userId,
                  enrollments: {
                    some: {
                      studentId: {
                        in: studentIds
                      }
                    }
                  }
                },
                include: {
                  module: true,
                  tutor: {
                    select: { id: true, name: true }
                  }
                },
                orderBy: { createdAt: 'desc' }
              });
            }
          }
        }

        return {
          id: conv.id,
          name: conv.name,
          type: conv.type,
          sessionId: session?.id,
          session: session ? {
            id: session.id,
            module: {
              code: session.module.code,
              name: session.module.name
            },
            tutor: {
              id: session.tutor.id,
              name: session.tutor.name
            },
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location
          } : undefined,
          participants: conv.participants.map(p => ({
            id: p.id,
            userId: p.userId,
            userName: p.user.name,
            userRole: p.user.role,
            avatar: p.user.profile?.profilePicture,
            joinedAt: p.joinedAt,
            lastRead: p.lastRead,
            unreadCount: p.unreadCount,
            isOnline: p.user.profile?.isOnline || false
          })),
          lastMessage: conv.messages[0] ? {
            content: conv.messages[0].content,
            senderName: conv.messages[0].sender.name,
            sentAt: conv.messages[0].sentAt
          } : undefined,
          totalMessages: conv._count.messages,
          unreadCount: userParticipant?.unreadCount || 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching group chats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch group chats' 
    });
  }
};

/**
 * Get group chat by session ID
 */
export const getGroupChatBySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionId = parseInt(req.params.sessionId);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // First, check if user is enrolled in the session
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: userId
        }
      }
    });

    // Or check if user is the tutor for this session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        tutor: true,
        module: true
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const isAuthorized = enrollment || session.tutorId === userId;
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this session chat' });
    }

    // Find or create conversation for this session
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: 'session_chat',
        // You might store session ID in name or create a separate field
        name: `Session ${sessionId} Chat`
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
                  select: {
                    profilePicture: true,
                    isOnline: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      // Create conversation if it doesn't exist
      conversation = await prisma.conversation.create({
        data: {
          name: `Session ${sessionId} Chat`,
          type: 'session_chat',
          isGroup: true,
          createdBy: userId,
          participants: {
            create: [
              // Add the tutor
              {
                userId: session.tutorId,
                joinedAt: new Date()
              },
              // Add current user if they're not the tutor
              ...(session.tutorId !== userId ? [{
                userId: userId,
                joinedAt: new Date()
              }] : [])
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
                  role: true,
                  profile: {
                    select: {
                      profilePicture: true,
                      isOnline: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Add all enrolled students to the conversation
      const enrollments = await prisma.enrollment.findMany({
        where: { sessionId },
        include: { student: true }
      });

      for (const enrollment of enrollments) {
        if (enrollment.studentId !== userId) {
          await prisma.conversationParticipant.create({
            data: {
              conversationId: conversation.id,
              userId: enrollment.studentId,
              joinedAt: new Date()
            }
          });
        }
      }
    }

    // Format response
    const formattedConversation = {
      id: conversation.id,
      name: conversation.name,
      type: conversation.type,
      sessionId: sessionId,
      session: {
        id: session.id,
        module: {
          code: session.module.code,
          name: session.module.name
        },
        tutor: {
          id: session.tutor.id,
          name: session.tutor.name
        },
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location
      },
      participants: conversation.participants.map(p => ({
        id: p.id,
        userId: p.userId,
        userName: p.user.name,
        userRole: p.user.role,
        avatar: p.user.profile?.profilePicture,
        joinedAt: p.joinedAt,
        lastRead: p.lastRead,
        unreadCount: p.unreadCount,
        isOnline: p.user.profile?.isOnline || false
      })),
      totalMessages: 0, // Will be calculated when needed
      unreadCount: 0,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    res.json({
      success: true,
      data: formattedConversation
    });

  } catch (error) {
    console.error('Error fetching session group chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch session group chat' 
    });
  }
};

/**
 * Create a new group chat for a session
 */
export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId, name, participants } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Verify session exists and user has access
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Check if user is the tutor or enrolled in the session
    const isAuthorized = session.tutorId === userId || 
      await prisma.enrollment.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: userId
          }
        }
      });

    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Create the conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: name || `Session ${sessionId} Chat`,
        type: 'session_chat',
        isGroup: true,
        createdBy: userId,
        participants: {
          create: [
            {
              userId: userId,
              joinedAt: new Date()
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

    res.json({
      success: true,
      data: {
        id: conversation.id,
        name: conversation.name,
        type: conversation.type,
        sessionId: sessionId,
        participants: conversation.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          userName: p.user.name,
          userRole: p.user.role,
          joinedAt: p.joinedAt,
          unreadCount: p.unreadCount
        })),
        totalMessages: 0,
        unreadCount: 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create group chat' 
    });
  }
};

/**
 * Get messages for a group chat
 */
export const getGroupChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Verify user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Get messages
    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count
    const total = await prisma.conversationMessage.count({
      where: { conversationId }
    });

    // Format messages
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      senderRole: msg.sender.role,
      content: msg.content,
      messageType: 'text',
      sentAt: msg.sentAt,
      editedAt: msg.editedAt,
      isRead: msg.isRead,
      isOwn: msg.senderId === userId
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching group chat messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
};

/**
 * Send message to a group chat
 */
export const sendGroupMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);
    const { content, messageType = 'text', attachments = [] } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Create the message
    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Update conversation's updatedAt
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
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      content: message.content,
      messageType: 'text',
      sentAt: message.sentAt,
      editedAt: message.editedAt,
      isRead: message.isRead,
      isOwn: true
    };

    res.json({
      success: true,
      data: formattedMessage
    });

  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message' 
    });
  }
};

/**
 * Mark messages as read
 */
export const markGroupMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);
    const { messageIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Update messages as read
    await prisma.conversationMessage.updateMany({
      where: {
        id: { in: messageIds },
        conversationId
      },
      data: { isRead: true }
    });

    // Reset unread count for this user
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        unreadCount: 0,
        lastRead: new Date()
      }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark messages as read' 
    });
  }
};

/**
 * Delete a group chat
 */
export const deleteGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // First, check if the conversation exists and get its details
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, role: true }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Check if user is a participant in the conversation
    const userParticipant = conversation.participants.find(p => p.userId === userId);
    if (!userParticipant) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this conversation' });
    }

    // For session chats, only allow deletion if:
    // 1. User is the creator (tutor) of the conversation, OR
    // 2. User is an admin
    if (conversation.type === 'session_chat') {
      const userRole = userParticipant.user.role;
      const isCreator = conversation.createdBy === userId;
      const isAdmin = userRole === 'admin';
      
      if (!isCreator && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Only the session tutor or admin can delete session chats' 
        });
      }
    }
    // For regular group chats, allow deletion if user is creator or admin
    else if (conversation.type === 'group') {
      const userRole = userParticipant.user.role;
      const isCreator = conversation.createdBy === userId;
      const isAdmin = userRole === 'admin';
      
      if (!isCreator && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Only the group creator or admin can delete group chats' 
        });
      }
    }
    // For direct conversations, don't allow deletion, only leaving
    else if (conversation.type === 'direct') {
      return res.status(400).json({ 
        success: false, 
        error: 'Direct conversations cannot be deleted. Use leave instead.' 
      });
    }

    // Delete all messages first
    await prisma.conversationMessage.deleteMany({
      where: { conversationId }
    });

    // Delete all participants
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId }
    });

    // Finally delete the conversation
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    res.json({ 
      success: true, 
      message: 'Conversation deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting group chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete conversation' 
    });
  }
};

/**
 * Leave a group chat (remove self from participants)
 */
export const leaveGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ success: false, error: 'You are not a participant in this conversation' });
    }

    // Get conversation details
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Remove the user from the conversation
    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    // Send a notification message if it's a group chat
    if (conversation.isGroup) {
      const leavingUser = conversation.participants.find(p => p.userId === userId);
      if (leavingUser) {
        // Find a remaining participant to send the message as (preferably the creator)
        const remainingParticipants = conversation.participants.filter(p => p.userId !== userId);
        const messageSender = remainingParticipants.find(p => p.userId === conversation.createdBy) || remainingParticipants[0];
        
        if (messageSender) {
          await prisma.conversationMessage.create({
            data: {
              conversationId,
              senderId: messageSender.userId,
              content: `${leavingUser.user.name} has left the chat. 👋`
            }
          });
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Left conversation successfully' 
    });

  } catch (error) {
    console.error('Error leaving group chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to leave conversation' 
    });
  }
};
