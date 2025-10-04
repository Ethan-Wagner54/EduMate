import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        enrollments: {
          include: {
            session: {
              include: {
                module: true,
                tutor: true,
                reviews: {
                  where: { studentId: userId }
                }
              }
            }
          }
        },
        attendances: {
          include: {
            session: {
              include: {
                module: true
              }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate overall stats
    const totalSessions = user.profile?.totalSessions || 0;
    const completedSessions = user.profile?.completedSessions || 0;
    const averageRating = user.profile?.averageRating || 0;

    // Calculate hours studied (estimate 1.5 hours per completed session)
    const hoursStudied = Math.round(completedSessions * 1.5 * 10) / 10;

    // Get active modules (modules with recent sessions)
    const activeModules = await prisma.module.findMany({
      where: {
        sessions: {
          some: {
            enrollments: {
              some: {
                studentId: userId
              }
            }
          }
        }
      }
    });

    // Calculate streak (simplified - days with activity in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = await prisma.activity.count({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    const streak = Math.min(recentActivities, 30); // Cap at 30 days

    const stats = {
      totalSessions,
      completedSessions,
      averageRating,
      hoursStudied,
      activeModules: activeModules.length,
      streak
    };

    // Get module progress
    const moduleProgress = [];
    for (const module of activeModules) {
      const moduleSessions = await prisma.session.findMany({
        where: {
          moduleId: module.id,
          enrollments: {
            some: {
              studentId: userId
            }
          }
        },
        include: {
          tutor: true,
          attendances: {
            where: { studentId: userId }
          },
          reviews: {
            where: { studentId: userId }
          }
        }
      });

      const totalModuleSessions = moduleSessions.length;
      const completedModuleSessions = moduleSessions.filter(session => 
        session.attendances.some(att => att.attended)
      ).length;

      const averageGrade = moduleSessions
        .map(s => s.reviews[0]?.rating || 0)
        .reduce((sum, rating, _, arr) => sum + rating / arr.length, 0);

      const progress = totalModuleSessions > 0 
        ? Math.round((completedModuleSessions / totalModuleSessions) * 100) 
        : 0;

      const tutor = moduleSessions[0]?.tutor;

      moduleProgress.push({
        name: module.name,
        code: module.code,
        progress,
        sessionsCompleted: completedModuleSessions,
        totalSessions: totalModuleSessions,
        averageGrade: Math.round(averageGrade * 20), // Convert 5-star to 100-point scale
        tutor: tutor?.name || 'Not assigned'
      });
    }

    // Format recent activity
    const recentActivity = user.activities.map(activity => ({
      date: activity.createdAt.toISOString().split('T')[0],
      activity: activity.description,
      module: activity.entityType === 'session' ? 'Session' : 'General',
      details: activity.description,
      rating: 5 // Default for completed activities
    }));

    res.status(200).json({
      stats,
      moduleProgress,
      recentActivity
    });
  } catch (error) {
    logger.error('progress_get_student_progress_failed', { 
      error: (error as any)?.message || String(error) 
    });
    res.status(500).json({ message: 'Error fetching student progress' });
  }
};

export const getPerformanceData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { months = 6 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const monthsCount = parseInt(months as string) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get sessions for the time period
    const sessions = await prisma.session.findMany({
      where: {
        enrollments: {
          some: {
            studentId: userId
          }
        },
        startTime: {
          gte: startDate
        }
      },
      include: {
        module: true,
        reviews: {
          where: { studentId: userId }
        },
        attendances: {
          where: { studentId: userId }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Group by month
    const monthlyData = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= monthStart && sessionDate < monthEnd;
      });

      const completedSessions = monthSessions.filter(session => 
        session.attendances.some(att => att.attended)
      );

      const averageRating = monthSessions.reduce((sum, session) => {
        const review = session.reviews[0];
        return sum + (review?.rating || 0);
      }, 0) / (monthSessions.length || 1);

      const averageGrade = averageRating * 20; // Convert to 100-point scale
      const hoursStudied = completedSessions.length * 1.5; // Estimate
      const attendanceRate = monthSessions.length > 0 
        ? (completedSessions.length / monthSessions.length) * 100 
        : 100;

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthShort: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        averageGrade: Math.min(100, Math.round(averageGrade * 10) / 10),
        sessionRating: Math.min(5, Math.round(averageRating * 10) / 10),
        sessionsCompleted: completedSessions.length,
        hoursStudied: Math.round(hoursStudied * 10) / 10,
        modulesActive: new Set(monthSessions.map(s => s.module.id)).size,
        attendanceRate: Math.round(attendanceRate * 10) / 10
      });
    }

    res.status(200).json(monthlyData);
  } catch (error) {
    logger.error('progress_get_performance_data_failed', { 
      error: (error as any)?.message || String(error) 
    });
    res.status(500).json({ message: 'Error fetching performance data' });
  }
};

export const getModulePerformanceData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get modules user is enrolled in
    const modules = await prisma.module.findMany({
      where: {
        sessions: {
          some: {
            enrollments: {
              some: {
                studentId: userId
              }
            }
          }
        }
      },
      include: {
        sessions: {
          where: {
            enrollments: {
              some: {
                studentId: userId
              }
            }
          },
          include: {
            reviews: {
              where: { studentId: userId }
            },
            attendances: {
              where: { studentId: userId }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    const modulePerformanceData = modules.map((module, index) => {
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f'];
      
      // Generate 6 months of data
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        
        const monthSessions = module.sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate.getMonth() === monthStart.getMonth() &&
                 sessionDate.getFullYear() === monthStart.getFullYear();
        });

        const averageRating = monthSessions.reduce((sum, session) => {
          const review = session.reviews[0];
          return sum + (review?.rating || 0);
        }, 0) / (monthSessions.length || 1);

        const grade = Math.min(100, Math.round(averageRating * 20)); // Convert to 100-point

        data.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          grade
        });
      }

      const currentGrade = data[data.length - 1]?.grade || 0;
      const firstGrade = data[0]?.grade || 0;

      return {
        code: module.code,
        name: module.name,
        color: colors[index % colors.length],
        data,
        currentGrade,
        trend: currentGrade >= firstGrade ? 'up' : 'down'
      };
    });

    res.status(200).json(modulePerformanceData);
  } catch (error) {
    logger.error('progress_get_module_performance_failed', { 
      error: (error as any)?.message || String(error) 
    });
    res.status(500).json({ message: 'Error fetching module performance data' });
  }
};