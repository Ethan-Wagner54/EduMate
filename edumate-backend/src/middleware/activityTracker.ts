import { Request, Response, NextFunction } from 'express';
import socketService from '../services/socketService';

/**
 * Middleware to track user activity on API requests
 * Updates lastSeen timestamp when authenticated users make requests
 */
export const trackUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  // Only track activity for authenticated users
  if (req.user?.userId) {
    try {
      // Update user activity asynchronously to not block the request
      socketService.updateUserActivity(req.user.userId).catch(error => {
        console.error('Failed to track user activity:', error);
      });
    } catch (error) {
      // Don't block the request if activity tracking fails
      console.error('Failed to track user activity:', error);
    }
  }
  
  next();
};