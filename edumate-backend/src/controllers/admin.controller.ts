import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client'; // Added 'Role' import
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
      },
    });
    res.status(200).json(users);
  } catch (error) {
    logger.error('admin_list_users_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const adminUser = req.user!;
    const { userId, role } = req.body as { userId?: number; role?: Role }; // Use Role type

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role are required' });
    }

    const allowedRoles: Role[] = [Role.student, Role.tutor, Role.admin];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${allowedRoles.join(', ')}` });
    }

    const existing = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (existing.role === Role.admin && role !== Role.admin) {
      const otherAdmins = await prisma.user.count({ where: { role: Role.admin, NOT: { id: existing.id } } });
      if (otherAdmins === 0) {
        return res.status(409).json({ message: 'Cannot demote the last remaining admin' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });

    res.status(200).json(updatedUser);
    
    await logAudit(adminUser.userId, 'User', updatedUser.id, `ROLE_UPDATED_TO_${role.toUpperCase()}`);

  } catch (error) {
    logger.error('admin_update_role_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// --- Tutor approvals ---

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
    if (tm.tutor.role !== Role.tutor) {
      await prisma.user.update({
        where: { id: tm.tutorId },
        data: { role: Role.tutor },
      });
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