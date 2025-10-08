import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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
 * Get all tutors for a student (My Tutors)
 */
export const getMyTutors = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get all tutors that this student has had sessions with
    const studentTutors = await prisma.studentTutor.findMany({
      where: {
        studentId: userId
      },
      include: {
        tutor: {
          include: {
            profile: {
              select: {
                bio: true,
                profilePicture: true,
                specialties: true,
                averageRating: true,
                totalSessions: true,
                isOnline: true,
                lastSeen: true
              }
            },
            tutorModules: {
              include: {
                module: {
                  select: {
                    code: true,
                    name: true,
                    faculty: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastSessionDate: 'desc' // Most recently interacted tutors first
      }
    });

    // Format the response
    const formattedTutors = studentTutors.map(relationship => {
      const tutor = relationship.tutor;
      
      return {
        relationshipId: relationship.id,
        tutorId: tutor.id,
        name: tutor.name,
        email: tutor.email,
        bio: tutor.profile?.bio || '',
        profilePicture: tutor.profile?.profilePicture,
        specialties: tutor.profile?.specialties || [],
        averageRating: tutor.profile?.averageRating || 0,
        totalSessions: tutor.profile?.totalSessions || 0,
        isOnline: tutor.profile?.isOnline || false,
        lastSeen: tutor.profile?.lastSeen,
        
        // Relationship-specific data
        firstSessionDate: relationship.firstSessionDate,
        lastSessionDate: relationship.lastSessionDate,
        totalSessionsTogether: relationship.totalSessions,
        averageRatingGiven: relationship.averageRating,
        
        // Modules this tutor teaches
        modules: tutor.tutorModules.map(tm => ({
          code: tm.module.code,
          name: tm.module.name,
          faculty: tm.module.faculty
        }))
      };
    });

    res.json({
      success: true,
      data: {
        tutors: formattedTutors,
        totalCount: formattedTutors.length
      }
    });

  } catch (error) {
    console.error('Error fetching my tutors:', error);
    logger.error('get_my_tutors_failed', { 
      userId: req.user?.userId,
      error: (error as any)?.message || String(error) 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tutors' 
    });
  }
};

/**
 * Get detailed tutor profile for a student
 */
export const getTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tutorId = parseInt(req.params.tutorId);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!tutorId) {
      return res.status(400).json({ success: false, error: 'Tutor ID is required' });
    }

    // Check if student has a relationship with this tutor
    const relationship = await prisma.studentTutor.findUnique({
      where: {
        studentId_tutorId: {
          studentId: userId,
          tutorId: tutorId
        }
      }
    });

    if (!relationship) {
      return res.status(404).json({ 
        success: false, 
        error: 'You have not had any sessions with this tutor' 
      });
    }

    // Get detailed tutor information
    const tutor = await prisma.user.findUnique({
      where: { 
        id: tutorId,
        role: 'tutor'
      },
      include: {
        profile: true,
        tutorModules: {
          include: {
            module: true
          }
        },
        sessions: {
          where: {
            enrollments: {
              some: {
                studentId: userId,
                status: 'joined'
              }
            }
          },
          include: {
            module: {
              select: {
                code: true,
                name: true
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          },
          take: 10 // Last 10 sessions together
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }

    const formattedProfile = {
      tutorId: tutor.id,
      name: tutor.name,
      email: tutor.email,
      bio: tutor.profile?.bio || '',
      profilePicture: tutor.profile?.profilePicture,
      specialties: tutor.profile?.specialties || [],
      averageRating: tutor.profile?.averageRating || 0,
      totalSessions: tutor.profile?.totalSessions || 0,
      isOnline: tutor.profile?.isOnline || false,
      lastSeen: tutor.profile?.lastSeen,
      
      // Relationship data
      firstSessionDate: relationship.firstSessionDate,
      lastSessionDate: relationship.lastSessionDate,
      totalSessionsTogether: relationship.totalSessions,
      averageRatingGiven: relationship.averageRating,
      
      // Modules
      modules: tutor.tutorModules.map(tm => ({
        id: tm.module.id,
        code: tm.module.code,
        name: tm.module.name,
        faculty: tm.module.faculty
      })),
      
      // Recent sessions together
      recentSessions: tutor.sessions.map(session => ({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        module: {
          code: session.module.code,
          name: session.module.name
        }
      }))
    };

    res.json({
      success: true,
      data: formattedProfile
    });

  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    logger.error('get_tutor_profile_failed', { 
      userId: req.user?.userId,
      tutorId: req.params.tutorId,
      error: (error as any)?.message || String(error) 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tutor profile' 
    });
  }
};

/**
 * Rate a tutor (update the average rating for this student-tutor relationship)
 */
export const rateTutor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tutorId = parseInt(req.params.tutorId);
    const { rating } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!tutorId) {
      return res.status(400).json({ success: false, error: 'Tutor ID is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Check if relationship exists
    const relationship = await prisma.studentTutor.findUnique({
      where: {
        studentId_tutorId: {
          studentId: userId,
          tutorId: tutorId
        }
      }
    });

    if (!relationship) {
      return res.status(404).json({ 
        success: false, 
        error: 'You have not had any sessions with this tutor' 
      });
    }

    // Update the rating
    await prisma.studentTutor.update({
      where: {
        studentId_tutorId: {
          studentId: userId,
          tutorId: tutorId
        }
      },
      data: {
        averageRating: rating
      }
    });

    res.json({
      success: true,
      message: 'Tutor rated successfully'
    });

  } catch (error) {
    console.error('Error rating tutor:', error);
    logger.error('rate_tutor_failed', { 
      userId: req.user?.userId,
      tutorId: req.params.tutorId,
      error: (error as any)?.message || String(error) 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to rate tutor' 
    });
  }
};