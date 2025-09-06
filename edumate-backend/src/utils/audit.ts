import { prisma } from "../db";

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
  } catch (err) {
    // Avoid crashing the request if audit fails; just log.
    console.error("Audit log failed:", err);
  }
}
