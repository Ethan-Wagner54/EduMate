import { PrismaClient, SessionStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/audit';

const prisma = new PrismaClient();

// A helper function to check for date overlaps
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

// Helper function to create or update session group chat
async function createOrUpdateSessionGroupChat(sessionId: number, userId: number) {
  logger.info('createOrUpdateSessionGroupChat_started', { sessionId, userId });
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      module: true,
      tutor: { select: { id: true, name: true } }
    }
  });

  if (!session) {
    logger.error('createOrUpdateSessionGroupChat_session_not_found', { sessionId, userId });
    return null;
  }
  
  logger.info('createOrUpdateSessionGroupChat_session_found', { 
    sessionId, 
    userId, 
    moduleCode: session.module.code, 
    tutorId: session.tutorId 
  });

  // Check if a group chat already exists for this specific session
  const conversationName = `${session.module.code} - ${session.module.name} Session ${sessionId}`;
  logger.info('createOrUpdateSessionGroupChat_looking_for_conversation', { 
    sessionId, 
    userId, 
    conversationName 
  });
  
  let conversation = await prisma.conversation.findFirst({
    where: {
      type: 'session_chat',
      name: conversationName
    },
    include: {
      participants: true
    }
  });

  if (!conversation) {
    logger.info('createOrUpdateSessionGroupChat_creating_new_conversation', { 
      sessionId, 
      userId, 
      conversationName 
    });
    // Create a new group chat for this specific session
    conversation = await prisma.conversation.create({
      data: {
        name: conversationName,
        type: 'session_chat',
        isGroup: true,
        createdBy: session.tutorId,
        participants: {
          create: [
            // Add the tutor first
            {
              userId: session.tutorId,
              joinedAt: new Date()
            }
          ]
        }
      },
      include: {
        participants: true
      }
    });
    
    logger.info('createOrUpdateSessionGroupChat_conversation_created', { 
      sessionId, 
      userId, 
      conversationId: conversation.id,
      tutorAdded: session.tutorId 
    });

    // Send welcome message
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.tutorId,
        content: `Welcome to the ${session.module.code} study group! Feel free to ask questions and discuss topics related to our sessions. 🎓`
      }
    });
    
    logger.info('createOrUpdateSessionGroupChat_welcome_message_sent', { 
      sessionId, 
      userId, 
      conversationId: conversation.id 
    });
  } else {
    logger.info('createOrUpdateSessionGroupChat_conversation_exists', { 
      sessionId, 
      userId, 
      conversationId: conversation.id,
      participantCount: conversation.participants.length 
    });
  }

  // Check if the user is already a participant
  const existingParticipant = conversation.participants.find(p => p.userId === userId);
  logger.info('createOrUpdateSessionGroupChat_checking_participant', { 
    sessionId, 
    userId, 
    conversationId: conversation.id,
    existingParticipant: !!existingParticipant 
  });
  
  if (!existingParticipant) {
    logger.info('createOrUpdateSessionGroupChat_adding_new_participant', { 
      sessionId, 
      userId, 
      conversationId: conversation.id 
    });
    
    // Add the new student to the group chat
    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: userId,
        joinedAt: new Date()
      }
    });
    
    logger.info('createOrUpdateSessionGroupChat_participant_added', { 
      sessionId, 
      userId, 
      conversationId: conversation.id 
    });

    // Send notification message about new member
    const newUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (newUser) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: session.tutorId,
          content: `${newUser.name} has joined the session! Welcome! 👋`
        }
      });
      
      logger.info('createOrUpdateSessionGroupChat_join_message_sent', { 
        sessionId, 
        userId, 
        conversationId: conversation.id,
        userName: newUser.name 
      });
    } else {
      logger.error('createOrUpdateSessionGroupChat_user_not_found_for_message', { 
        sessionId, 
        userId, 
        conversationId: conversation.id 
      });
    }
  } else {
    logger.info('createOrUpdateSessionGroupChat_participant_already_exists', { 
      sessionId, 
      userId, 
      conversationId: conversation.id 
    });
  }

  logger.info('createOrUpdateSessionGroupChat_completed', { 
    sessionId, 
    userId, 
    conversationId: conversation.id 
  });
  
  return conversation.id;
}

export const listSessions = async (req: Request, res: Response) => {
  try {
    const { module: moduleCode, tutorId } = req.query as { module?: string; tutorId?: string };
    
    // Only show published sessions that haven't started yet (upcoming sessions)
    const now = new Date();
    const where: any = { 
      status: SessionStatus.published,
      startTime: {
        gt: now  // Only sessions that start in the future
      }
    }; 

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
        tutor: { 
          select: { 
            id: true, 
            name: true,
            profile: {
              select: { averageRating: true }
            }
          } 
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startTime: 'asc' }, // Show upcoming sessions in chronological order
    });

    // Format sessions for BrowseSessions component
    const formattedSessions = sessions.map(session => {
      const tutorInitials = session.tutor.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('');
      
      return {
        id: session.id,
        course: session.module.code,
        title: `${session.module.name} - Advanced Topics`,
        tutor: session.tutor.name,
        tutorInitials,
        rating: session.tutor.profile?.averageRating || 4.5,
        isFree: true, // Assuming all sessions are free
        time: formatSessionTime(session.startTime, session.endTime),
        location: session.location || 'TBA',
        enrolled: `${session._count.enrollments}/${session.capacity || 'unlimited'} students enrolled`,
        description: session.description || `Session covering ${session.module.name} concepts`,
        startTime: session.startTime,
        endTime: session.endTime,
        capacity: session.capacity,
        enrolledCount: session._count.enrollments,
        module: session.module,
        tutorId: session.tutor.id,
        status: session.status
      };
    });

    return res.json(formattedSessions);
  } catch (e) {
    logger.error('sessions_list_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to list sessions' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { moduleId, startTime, endTime, location, capacity, description } = req.body;

    if (!moduleId || !startTime || !endTime || !description?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate that the tutor is authorized to teach this module
    const tutorModule = await prisma.tutorModule.findFirst({
      where: {
        tutorId: user.userId,
        moduleId: Number(moduleId),
        approvedByAdmin: true
      }
    });
    
    if (!tutorModule) {
      return res.status(403).json({ error: 'You are not authorized to create sessions for this module' });
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
        description: description.trim(),
        // Corrected to lowercase 'published'
        status: SessionStatus.published,
      },
    });

    // Create group chat for the new session
    try {
      const conversationId = await createOrUpdateSessionGroupChat(session.id, user.userId);
      logger.info('session_group_chat_created', { 
        sessionId: session.id, 
        tutorId: user.userId, 
        conversationId 
      });
    } catch (chatError) {
      // Log error but don't fail the session creation
      logger.error('session_group_chat_creation_failed', { 
        sessionId: session.id, 
        tutorId: user.userId, 
        error: (chatError as any)?.message || String(chatError) 
      });
    }

    res.status(201).json(session);
    await logAudit(user.userId, 'Session', session.id, 'CREATE');
  } catch (e) {
    logger.error('sessions_create_failed', { 
      error: (e as any)?.message || String(e), 
      userId: req.user?.userId,
      requestBody: req.body,
      stack: (e as any)?.stack
    });
    return res.status(500).json({ error: 'Failed to create session' });
  }
};

export const leaveSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);

    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can leave sessions' });
    }

    // Check if student is enrolled in the session
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        sessionId,
        studentId: user.userId,
        status: 'joined'
      },
      include: {
        session: {
          include: {
            module: { select: { name: true } },
            tutor: { select: { name: true } }
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'You are not enrolled in this session or have already left' });
    }

    // Update enrollment status to 'left'
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'left',
        leftAt: new Date()
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.userId,
        type: 'session_left',
        description: `Left ${enrollment.session.module.name} session with ${enrollment.session.tutor.name}`,
        entityType: 'session',
        entityId: sessionId
      }
    });

    // Send notification message to tutor in session group chat
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          name: `Session ${sessionId} Group Chat`
        }
      });

      if (conversation) {
        // Get user name for notification
        const userData = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { name: true }
        });
        
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: enrollment.session.tutorId,
            content: `${userData?.name || 'A student'} has left the session.`
          }
        });
      }
    } catch (chatError) {
      // Don't fail the leave operation if chat notification fails
      logger.error('leave_session_chat_notification_failed', { 
        sessionId, 
        userId: user.userId, 
        error: (chatError as any)?.message || String(chatError) 
      });
    }

    res.json({ message: 'Successfully left the session' });
    await logAudit(user.userId, 'Enrollment', enrollment.id, 'LEAVE_SESSION');
  } catch (e) {
    logger.error('sessions_leave_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to leave session' });
  }
};

export const joinSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);
    const targetSession = await prisma.session.findUnique({ 
      where: { id: sessionId },
      include: { module: true }
    });

    if (!targetSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if student is enrolled in the module (for students, we assume they can join any session for now)
    // In a real system, you might want to check if they're enrolled in the module
    // For now, we'll allow any student to join any session

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

    // Create or update student-tutor relationship
    try {
      const sessionDate = targetSession.startTime;
      
      await prisma.studentTutor.upsert({
        where: {
          studentId_tutorId: {
            studentId: user.userId,
            tutorId: targetSession.tutorId
          }
        },
        update: {
          lastSessionDate: sessionDate,
          totalSessions: { increment: 1 }
        },
        create: {
          studentId: user.userId,
          tutorId: targetSession.tutorId,
          firstSessionDate: sessionDate,
          lastSessionDate: sessionDate,
          totalSessions: 1
        }
      });
      
      logger.info('student_tutor_relationship_updated', { 
        studentId: user.userId,
        tutorId: targetSession.tutorId,
        sessionId 
      });
    } catch (relationshipError) {
      // Log error but don't fail the enrollment
      logger.error('student_tutor_relationship_failed', { 
        studentId: user.userId,
        tutorId: targetSession.tutorId,
        sessionId,
        error: (relationshipError as any)?.message || String(relationshipError) 
      });
    }

    // Create or add student to session group chat
    logger.info('joinSession_about_to_call_createOrUpdateSessionGroupChat', { 
      sessionId, 
      userId: user.userId 
    });
    
    try {
      const conversationId = await createOrUpdateSessionGroupChat(sessionId, user.userId);
      logger.info('joinSession_group_chat_success', { 
        sessionId, 
        userId: user.userId, 
        conversationId 
      });
    } catch (chatError) {
      // Log error but don't fail the enrollment
      logger.error('joinSession_group_chat_failed', { 
        sessionId, 
        userId: user.userId, 
        error: (chatError as any)?.message || String(chatError),
        stack: (chatError as any)?.stack 
      });
    }
    
    logger.info('joinSession_completed_successfully', { 
      sessionId, 
      userId: user.userId 
    });

    res.json({ ok: true });
    await logAudit(user.userId, 'Enrollment', enrollment.id, 'JOIN');
  } catch (e) {
    logger.error('sessions_join_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to join session' });
  }
};


export const editSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);
    const { moduleId, startTime, endTime, location, capacity } = req.body;

    // Check if session exists and belongs to the user
    const existingSession = await prisma.session.findFirst({
      where: { id: sessionId, tutorId: user.userId },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // If times are being changed, check for overlaps
    if (startTime && endTime) {
      const sTime = new Date(startTime);
      const eTime = new Date(endTime);

      const conflictingSession = await prisma.session.findFirst({
        where: {
          tutorId: user.userId,
          id: { not: sessionId }, // Exclude current session
          startTime: { lt: eTime },
          endTime: { gt: sTime },
        },
      });

      if (conflictingSession) {
        return res.status(409).json({ error: 'Overlapping session exists for this tutor' });
      }
    }

    // Build update data
    const updateData: any = {};
    if (moduleId !== undefined) updateData.moduleId = Number(moduleId);
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity ? Number(capacity) : null;

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        module: { select: { code: true, name: true } },
        tutor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });

    res.json(updatedSession);
    await logAudit(user.userId, 'Session', sessionId, 'UPDATE');
  } catch (e) {
    logger.error('sessions_edit_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to edit session' });
  }
};

export const cancelSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);
    const { reason } = req.body;

    if (user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can cancel sessions' });
    }

    // Check if session exists and belongs to the user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, tutorId: user.userId },
      include: {
        module: { select: { name: true } },
        enrollments: {
          where: { status: 'joined' },
          include: { student: { select: { name: true } } }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({ error: 'Session is already cancelled' });
    }

    // Update session status to cancelled
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Log activity for tutor
    await prisma.activity.create({
      data: {
        userId: user.userId,
        type: 'session_cancelled_by_tutor',
        description: `Cancelled ${session.module.name} session${reason ? ` - Reason: ${reason}` : ''}`,
        entityType: 'session',
        entityId: sessionId
      }
    });

    // Send notification messages to all enrolled students
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          name: `Session ${sessionId} Group Chat`
        }
      });

      if (conversation) {
        // Get tutor name for notification
        const tutorData = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { name: true }
        });
        
        const tutorName = tutorData?.name || 'The tutor';
        const cancelMessage = reason 
          ? `This session has been cancelled by ${tutorName}. Reason: ${reason}`
          : `This session has been cancelled by ${tutorName}.`;
        
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: user.userId,
            content: cancelMessage
          }
        });
      }

      // Create individual activities for each enrolled student
      const tutorData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true }
      });
      const tutorName = tutorData?.name || 'The tutor';
      
      for (const enrollment of session.enrollments) {
        await prisma.activity.create({
          data: {
            userId: enrollment.studentId,
            type: 'session_cancelled_by_tutor',
            description: `${session.module.name} session was cancelled by ${tutorName}${reason ? ` - Reason: ${reason}` : ''}`,
            entityType: 'session',
            entityId: sessionId
          }
        });
      }

    } catch (notificationError) {
      // Don't fail the cancellation if notifications fail
      logger.error('cancel_session_notification_failed', { 
        sessionId, 
        userId: user.userId, 
        error: (notificationError as any)?.message || String(notificationError) 
      });
    }

    res.json({ 
      message: 'Session successfully cancelled', 
      notifiedStudents: session.enrollments.length 
    });
    await logAudit(user.userId, 'Session', sessionId, 'CANCEL');
  } catch (e) {
    logger.error('sessions_cancel_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to cancel session' });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const sessionId = Number(req.params.id);

    // Check if session exists and belongs to the user
    const existingSession = await prisma.session.findFirst({
      where: { id: sessionId, tutorId: user.userId },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // Delete the session (this will cascade delete enrollments due to foreign key constraints)
    await prisma.session.delete({
      where: { id: sessionId },
    });

    res.json({ ok: true });
    await logAudit(user.userId, 'Session', sessionId, 'DELETE');
  } catch (e) {
    logger.error('sessions_delete_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to delete session' });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const role = user.role || 'student';
    
    if (role === 'tutor') {
      // Return sessions created by the tutor
      const sessions = await prisma.session.findMany({
        where: { tutorId: user.userId },
        include: {
          module: { select: { code: true, name: true } },
          tutor: {
            select: {
              id: true,
              name: true,
              profile: { select: { averageRating: true } },
            },
          },
          _count: { select: { enrollments: true } },
        },
        orderBy: { startTime: 'asc' },
      });

      // Format sessions
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        course: session.module.code,
        title: `${session.module.name} - Tutoring Session`,
        tutor: session.tutor.name,
        rating: session.tutor.profile?.averageRating || 4.5,
        time: formatSessionTime(session.startTime, session.endTime),
        location: session.location || 'TBA',
        enrolled: `${session._count.enrollments}/${session.capacity || 'unlimited'} students enrolled`,
        startTime: session.startTime,
        endTime: session.endTime,
        capacity: session.capacity,
        enrolledCount: session._count.enrollments,
        module: session.module,
        tutorId: session.tutor.id,
        status: session.status,
        description: session.description || `Session covering ${session.module.name} concepts`,
      }));

      return res.json(formattedSessions);
    } else {
      // Return sessions the student is enrolled in (including left sessions for filtering)
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.userId,
          status: { in: ['joined', 'left'] },  // Include both joined and left sessions
          session: {
            status: 'published'  // Only include published sessions
          }
        },
        include: {
          session: {
            include: {
              module: { select: { code: true, name: true } },
              tutor: {
                select: {
                  id: true,
                  name: true,
                  profile: { select: { averageRating: true } },
                },
              },
              _count: { select: { enrollments: true } },
            },
          },
        },
        orderBy: { session: { startTime: 'asc' } },
      });

      // Debug logging for getUserSessions
      logger.info('getUserSessions_debug', {
        userId: user.userId,
        totalEnrollments: enrollments.length,
        enrollmentDetails: enrollments.map(e => ({
          sessionId: e.session.id,
          startTime: e.session.startTime,
          endTime: e.session.endTime,
          moduleCode: e.session.module.code,
          sessionStatus: e.session.status,
          enrollmentStatus: e.status
        }))
      });
      
      // Format sessions
      const formattedSessions = enrollments.map(enrollment => {
        const session = enrollment.session;
        return {
          id: session.id,
          course: session.module.code,
          title: `${session.module.name} - Tutoring Session`,
          tutor: session.tutor.name,
          rating: session.tutor.profile?.averageRating || 4.5,
          time: formatSessionTime(session.startTime, session.endTime),
          location: session.location || 'TBA',
          enrolled: `${session._count.enrollments}/${session.capacity || 'unlimited'} students enrolled`,
          startTime: session.startTime,
          endTime: session.endTime,
          capacity: session.capacity,
          enrolledCount: session._count.enrollments,
          module: session.module,
          tutorId: session.tutor.id,
          status: session.status,
          description: session.description || `Session covering ${session.module.name} concepts`,
          enrollmentStatus: enrollment.status,
        };
      });

      return res.json(formattedSessions);
    }
  } catch (e) {
    logger.error('sessions_get_user_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get user sessions' });
  }
};

export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);
    const user = req.user!;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        module: { select: { code: true, name: true } },
        tutor: {
          select: {
            id: true,
            name: true,
            profile: { select: { averageRating: true } },
          },
        },
        _count: { select: { enrollments: true } },
        enrollments: {
          where: { studentId: user.userId, status: 'joined' },
          select: { status: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is enrolled
    const isEnrolled = session.enrollments.length > 0;
    const canJoin = !isEnrolled && (session.capacity === null || session._count.enrollments < session.capacity);

    const formattedSession = {
      id: session.id,
      course: session.module.code,
      title: `${session.module.name} - Tutoring Session`,
      tutor: session.tutor.name,
      rating: session.tutor.profile?.averageRating || 4.5,
      time: formatSessionTime(session.startTime, session.endTime),
      location: session.location || 'TBA',
      enrolled: `${session._count.enrollments}/${session.capacity || 'unlimited'} students enrolled`,
      startTime: session.startTime,
      endTime: session.endTime,
      capacity: session.capacity,
      enrolledCount: session._count.enrollments,
      module: session.module,
      tutorId: session.tutor.id,
      status: session.status,
      description: session.description || `Session covering ${session.module.name} concepts`,
      isEnrolled,
      canJoin,
    };

    return res.json(formattedSession);
  } catch (e) {
    logger.error('sessions_get_details_failed', { error: (e as any)?.message || String(e) });
    return res.status(500).json({ error: 'Failed to get session details' });
  }
};

// Helper function to format session time
function formatSessionTime(startTime: Date, endTime: Date): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  const isToday = start.toDateString() === now.toDateString();
  const isTomorrow = start.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  let dayText;
  if (isToday) {
    dayText = 'Today';
  } else if (isTomorrow) {
    dayText = 'Tomorrow';
  } else {
    dayText = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  const startTimeText = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTimeText = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  
  return `${dayText} • ${startTimeText} - ${endTimeText} (${duration} min)`;
}
