import { PrismaClient } from "@prisma/client";
import { logger } from "./utils/logger";

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('warn', (e) => {
  logger.warn('prisma_warn', { target: e.target, message: e.message });
});
prisma.$on('error', (e) => {
  logger.error('prisma_error', { target: e.target, message: e.message });
});
