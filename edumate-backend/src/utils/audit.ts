import { prisma } from "../db";
import { logger } from "./logger";

export async function logAudit(
  userId: number | null,
  entityType: string,
  entityId: number | null,
  action: string
) {
  try {
    await prisma.auditLog.create({
      data: { userId: userId ?? undefined, entityType, entityId: entityId ?? undefined, action },
    });
    logger.info("audit_log", { userId, entityType, entityId, action });
  } 
  catch (err) {
    // Avoid crashing the request if audit fails; just log.
    logger.error("audit_log_failed", { error: (err as any)?.message || String(err) });
  }
}
