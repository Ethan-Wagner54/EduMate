import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend the Express Request type to include our user payload
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

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = bearer.split(' ')[1].trim();
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // Attach user payload to the request object
  req.user = payload;
  next();
};