import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;
  const userId = req.user?.userId ?? null;

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    logger.info('http_request', {
      method,
      path: originalUrl,
      status: res.statusCode,
      duration_ms: Math.round(ms),
      userId,
    });
  });

  next();
}

