import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logAudit } from '../utils/audit';

const prisma = new PrismaClient();

export const listUsers = async (req: Request, res: Response) => {
  try {
    console.log('List Users Req',req)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    console.log('Total Users',users.length)
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Renamed from setUserRole to updateUserRole
export const updateUserRole = async (req: Request, res: Response) => {

  try {
    const adminUser = req.user!;
    console.log('Update User Information',adminUser)
    const { userId, role } = req.body as { userId: number; role: Role };

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role are required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.status(200).json(updatedUser);
    
    // Use the admin's ID from the token payload for the audit log
    await logAudit(adminUser.userId, 'User', updatedUser.id, `ROLE_UPDATED_TO_${role.toUpperCase()}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};