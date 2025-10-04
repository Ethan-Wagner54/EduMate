import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();


export const getUser = async (req: Request, res: Response) => {
  try {
    let id = Number(req.query.id);

    // If no ID provided, use the current user's ID from the JWT token
    if (!id || isNaN(id)) {
      if (req.user?.userId) {
        id = req.user.userId;
        logger.info('user_get_user_using_token', { userId: id });
      } else {
        return res.status(400).json({ message: 'Valid ID is required or user not authenticated' });
      }
    }

    const user = await prisma.user.findFirst({
      where: { id },
      include: {
        profile: true,
        tutorModules: {
          include: {
            module: true
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('user_get_user_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      name,
      email,
      phone,
      studentId,
      program,
      academicYear,
      faculty,
      campusLocation,
      qualifications,
      bio,
      favoriteSubjects,
      specialties
    } = req.body;

    // Update user basic information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(studentId && { studentId }),
        ...(program && { program }),
        ...(academicYear && { academicYear }),
        ...(faculty && { faculty }),
        ...(campusLocation && { campusLocation }),
        ...(qualifications && { qualifications })
      }
    });

    // Update or create user profile
    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(bio && { bio }),
        ...(favoriteSubjects && { favoriteSubjects }),
        ...(specialties && { specialties }),
        updatedAt: new Date()
      },
      create: {
        userId,
        bio: bio || null,
        favoriteSubjects: favoriteSubjects || [],
        specialties: specialties || []
      },
      include: {
        user: {
          include: {
            tutorModules: {
              include: {
                module: true
              }
            }
          }
        }
      }
    });

    logger.info('user_profile_updated', { userId });
    res.status(200).json({
      message: 'Profile updated successfully',
      user: userProfile.user,
      profile: userProfile
    });
  } catch (error) {
    logger.error('user_update_profile_failed', { error: (error as any)?.message || String(error) });
    res.status(500).json({ message: 'Error updating profile' });
  }
};
