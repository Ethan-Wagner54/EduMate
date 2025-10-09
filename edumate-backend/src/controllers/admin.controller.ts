import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logAudit } from '../utils/audit';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
        warningsCount: true,
        campusLocation: true,
        tutorModules: {
          select: {
            module: { select: { code: true, name: true } }
          }
        }
      },
    });
    res.status(200).json(users);
  } catch (error) {
    logger.error('admin_list_users_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Renamed from setUserRole to updateUserRole
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const { userId, role } = req.body as { userId?: number; role?: string };

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role are required' });
    }

    const allowedRoles: Role[] = ['student', 'tutor', 'admin'];
    if (!allowedRoles.includes(role as Role)) {
      return res.status(400).json({ message: `role must be one of: ${allowedRoles.join(', ')}` });
    }

    // Ensure the user exists and handle last-admin protection
    const existing = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextRole = role as Role;
    if (existing.role === 'admin' && nextRole !== 'admin') {
      const otherAdmins = await prisma.user.count({ where: { role: 'admin', NOT: { id: existing.id } } });
      if (otherAdmins === 0) {
        return res.status(409).json({ message: 'Cannot demote the last remaining admin' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: nextRole },
    });

    res.status(200).json(updatedUser);
    
    // Use the admin's ID from the token payload for the audit log
    await logAudit(adminUser.userId, 'User', updatedUser.id, `ROLE_UPDATED_TO_${nextRole.toUpperCase()}`);

  } catch (error) {
    logger.error('admin_update_role_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// --- Tutor approvals ---

// List pending tutor-module approval requests
export const listTutorRequests = async (_req: Request, res: Response) => {
  try {
    const pending = await prisma.tutorModule.findMany({
      where: { approvedByAdmin: false },
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
      },
    });
    return res.json(pending);
  } catch (error) {
    logger.error('admin_list_tutor_requests_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching tutor requests' });
  }
};

// Approve a pending tutor-module link
export const approveTutorRequest = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    const tm = await prisma.tutorModule.findUnique({
      where: { id },
      include: { tutor: true, module: true },
    });
    if (!tm) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (tm.approvedByAdmin) {
      return res.status(409).json({ message: 'Request already approved' });
    }
    if (tm.tutor.role !== 'tutor') {
      return res.status(409).json({ message: 'Linked user is not a tutor' });
    }

    const updated = await prisma.tutorModule.update({
      where: { id },
      data: { approvedByAdmin: true },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
      },
    });

    await logAudit(adminUser.userId, 'TutorModule', id, 'TUTOR_MODULE_APPROVED');
    return res.json(updated);
  } catch (error: any) {
    logger.error('admin_approve_tutor_request_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Request not found' });
    }
    return res.status(500).json({ message: 'Error approving tutor request' });
  }
};

// Reject a pending tutor-module link (delete the request)
export const rejectTutorRequest = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    const { reason } = (req.body as { reason?: string }) || {};
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    if (reason && reason.length > 200) {
      return res.status(400).json({ message: 'reason must be 200 characters or fewer' });
    }

    const tm = await prisma.tutorModule.findUnique({ where: { id } });
    if (!tm) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (tm.approvedByAdmin) {
      return res.status(409).json({ message: 'Cannot reject an already approved request' });
    }

    const deleted = await prisma.tutorModule.delete({
      where: { id },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
      },
    });

    await logAudit(
      adminUser.userId,
      'TutorModule',
      id,
      reason ? `TUTOR_MODULE_REJECTED:${reason}` : 'TUTOR_MODULE_REJECTED'
    );
    return res.json({ ok: true, deleted });
  } catch (error: any) {
    logger.error('admin_reject_tutor_request_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Request not found' });
    }
    return res.status(500).json({ message: 'Error rejecting tutor request' });
  }
};

// --- Audit logs ---

export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const { userId, entityType, action, from, to, limit } = req.query as {
      userId?: string;
      entityType?: string;
      action?: string;
      from?: string; // ISO date
      to?: string;   // ISO date
      limit?: string;
    };

    const take = Math.min(Math.max(parseInt(limit || '100', 10) || 100, 1), 500);
    if (userId && Number.isNaN(Number(userId))) {
      return res.status(400).json({ message: 'userId must be a number' });
    }

    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (from || to) {
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;
      if ((from && isNaN(fromDate!.getTime())) || (to && isNaN(toDate!.getTime()))) {
        return res.status(400).json({ message: 'from/to must be valid ISO date strings' });
      }
      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({ message: 'from must be <= to' });
      }
      where.createdAt = {};
      if (fromDate) (where.createdAt as any).gte = fromDate;
      if (toDate) (where.createdAt as any).lte = toDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.json(logs);
  } catch (error) {
    logger.error('admin_list_audit_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

// --- Sessions management (admin) ---

export const listSessions = async (_req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        tutor: { select: { id: true, name: true } },
        module: { select: { id: true, name: true, code: true } },
        enrollments: { select: { id: true } },
      },
    });

    const now = new Date();
    const mapped = sessions.map((s: any) => ({
      id: s.id,
      title: s.description || `${s.module?.name || s.module?.code || 'Session'} with ${s.tutor?.name || 'Tutor'}`,
      subject: s.module?.name || s.module?.code || 'N/A',
      tutorName: s.tutor?.name || 'N/A',
      scheduledAt: s.startTime,
      location: s.location || 'Online',
      participants: s.enrollments || [],
      status: s.cancelledAt
        ? 'cancelled'
        : (s.endTime && new Date(s.endTime) < now)
          ? 'completed'
          : (new Date(s.startTime) > now)
            ? 'scheduled'
            : 'active',
      description: s.description || null,
    }));

    return res.json(mapped);
  } catch (error) {
    logger.error('admin_list_sessions_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching sessions' });
  }
};

export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    const s = await prisma.session.findUnique({
      where: { id },
      include: {
        tutor: { select: { id: true, name: true, email: true } },
        module: { select: { id: true, name: true, code: true } },
        enrollments: {
          select: {
            id: true,
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!s) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const now = new Date();
    const details = {
      id: s.id,
      title: s.description || `${s.module?.name || s.module?.code || 'Session'} with ${s.tutor?.name || 'Tutor'}`,
      subject: s.module?.name || s.module?.code || 'N/A',
      tutorName: s.tutor?.name || 'N/A',
      scheduledAt: s.startTime,
      location: s.location || 'Online',
      participants: (s.enrollments || []).map((e: any) => ({
        id: e.student.id,
        name: e.student.name,
        email: e.student.email,
      })),
      status: s.cancelledAt
        ? 'cancelled'
        : (s.endTime && new Date(s.endTime) < now)
          ? 'completed'
          : (new Date(s.startTime) > now)
            ? 'scheduled'
            : 'active',
      description: s.description || null,
    };

    return res.json(details);
  } catch (error) {
    logger.error('admin_get_session_details_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching session details' });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { sessionId: id } }),
      prisma.message.deleteMany({ where: { sessionId: id } }),
      prisma.session.delete({ where: { id } }),
    ]);

    await logAudit(adminUser.userId, 'Session', id, 'SESSION_DELETED');
    return res.json({ ok: true });
  } catch (error: any) {
    logger.error('admin_delete_session_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Session not found' });
    }
    return res.status(500).json({ message: 'Error deleting session' });
  }
};

// --- User activation & warnings ---

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target.role === 'admin') {
      const otherActiveAdmins = await prisma.user.count({ where: { role: 'admin', isActive: true as any, NOT: { id: target.id } } as any });
      if (otherActiveAdmins === 0) {
        return res.status(409).json({ message: 'Cannot deactivate the last active admin' });
      }
    }

    if ((target as any).isActive === false) {
      return res.status(409).json({ message: 'User is already deactivated' });
    }

    const updated = await prisma.user.update({ where: { id }, data: { isActive: false } as any });

    await logAudit(adminUser.userId, 'User', id, 'USER_DEACTIVATED');
    return res.json(updated);
  } catch (error) {
    logger.error('admin_deactivate_user_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error deactivating user' });
  }
};

export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    if ((target as any).isActive === true) {
      return res.status(409).json({ message: 'User is already active' });
    }

    const updated = await prisma.user.update({ where: { id }, data: { isActive: true } as any });

    await logAudit(adminUser.userId, 'User', id, 'USER_REACTIVATED');
    return res.json(updated);
  } catch (error) {
    logger.error('admin_reactivate_user_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error reactivating user' });
  }
};

export const warnUser = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    const { reason } = (req.body as { reason?: string }) || {};
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'reason is required' });
    }
    if (reason.length > 200) {
      return res.status(400).json({ message: 'reason must be 200 characters or fewer' });
    }

    const updated = await prisma.user.update({ where: { id }, data: { warningsCount: { increment: 1 } } as any });
    await logAudit(adminUser.userId, 'User', id, `USER_WARNED:${reason}`);
    return res.json(updated);
  } catch (error) {
    logger.error('admin_warn_user_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error warning user' });
  }
};

// --- Chat moderation ---

export const listChats = async (_req: Request, res: Response) => {
  try {
    const msgs = await prisma.conversationMessage.findMany({
      orderBy: { sentAt: 'desc' },
      take: 200,
      include: {
        sender: { select: { id: true, name: true, email: true, warningsCount: true } },
        conversation: { select: { id: true, name: true, type: true, isGroup: true } },
      },
    });

    const mapped = msgs.map((m: any) => ({
      id: m.id,
      chatId: m.conversation?.id,
      content: m.content,
      timestamp: m.sentAt,
      senderId: m.sender?.id,
      senderName: m.sender?.name || 'Unknown',
      receiverName: m.conversation?.isGroup || m.conversation?.type === 'group' ? (m.conversation?.name || 'Group Chat') : 'Direct Message',
      type: m.conversation?.type === 'session_chat' ? 'session' : (m.conversation?.isGroup ? 'group' : (m.conversation?.type || 'direct')),
      isFlagged: (m as any).isFlagged,
      flagReason: (m as any).flagReason || undefined,
      severity: (m as any).severity || undefined,
      warningCount: m.sender?.warningsCount || 0,
      attachments: Array.isArray((m.metadata as any)?.attachments) ? (m.metadata as any).attachments : [],
    }));

    return res.json(mapped);
  } catch (error) {
    logger.error('admin_list_chats_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching chats' });
  }
};

export const listFlaggedMessages = async (_req: Request, res: Response) => {
  try {
    const msgs = await prisma.conversationMessage.findMany({
      where: { isFlagged: true as any },
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, warningsCount: true } },
        conversation: { select: { id: true, name: true, type: true, isGroup: true } },
      },
    });

    const mapped = msgs.map((m: any) => ({
      id: m.id,
      chatId: m.conversation?.id,
      content: m.content,
      timestamp: m.sentAt,
      senderId: m.sender?.id,
      senderName: m.sender?.name || 'Unknown',
      receiverName: m.conversation?.isGroup || m.conversation?.type === 'group' ? (m.conversation?.name || 'Group Chat') : 'Direct Message',
      type: m.conversation?.type === 'session_chat' ? 'session' : (m.conversation?.isGroup ? 'group' : (m.conversation?.type || 'direct')),
      isFlagged: (m as any).isFlagged,
      flagReason: (m as any).flagReason || undefined,
      severity: (m as any).severity || undefined,
      warningCount: m.sender?.warningsCount || 0,
      attachments: Array.isArray((m.metadata as any)?.attachments) ? (m.metadata as any).attachments : [],
    }));

    return res.json(mapped);
  } catch (error) {
    logger.error('admin_list_flagged_messages_failed', { error: (error as any)?.message || String(error) });
    return res.status(500).json({ message: 'Error fetching flagged messages' });
  }
};

export const deleteChatMessage = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    await prisma.conversationMessage.delete({ where: { id } });
    await logAudit(adminUser.userId, 'ConversationMessage', id, 'MESSAGE_DELETED');
    return res.json({ ok: true });
  } catch (error: any) {
    logger.error('admin_delete_message_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Message not found' });
    }
    return res.status(500).json({ message: 'Error deleting message' });
  }
};

export const flagMessage = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    const { reason, severity } = (req.body as { reason?: string; severity?: 'low'|'medium'|'high' }) || {};
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'reason is required' });
    }

    const updated = await prisma.conversationMessage.update({
      where: { id },
      data: { isFlagged: true, flagReason: reason, severity: (severity || 'medium') as any },
    });

    await logAudit(adminUser.userId, 'ConversationMessage', id, `MESSAGE_FLAGGED:${reason}:${severity || 'medium'}`);
    return res.json(updated);
  } catch (error: any) {
    logger.error('admin_flag_message_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Message not found' });
    }
    return res.status(500).json({ message: 'Error flagging message' });
  }
};

export const unflagMessage = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Valid id param is required' });
    }

    const updated = await prisma.conversationMessage.update({
      where: { id },
      data: { isFlagged: false, flagReason: null as any, severity: null as any },
    });

    await logAudit(adminUser.userId, 'ConversationMessage', id, 'MESSAGE_UNFLAGGED');
    return res.json(updated);
  } catch (error: any) {
    logger.error('admin_unflag_message_failed', { error: (error as any)?.message || String(error) });
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Message not found' });
    }
    return res.status(500).json({ message: 'Error unflagging message' });
  }
};
