import { Request, Response } from "express";
import { prisma } from "../db";
import { logAudit } from "../utils/audit";

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({ select: { id:true, name:true, email:true, role:true } });
  return res.json(users);
}

export async function setUserRole(req: Request, res: Response) {
  const admin = (req as any).user as { id:number };
  const { userId, role } = req.body as { userId:number; role: "student"|"tutor"|"admin" };
  if (!userId || !role) return res.status(400).json({ error: "userId and role required" });
  const user = await prisma.user.update({
    where: { id: Number(userId) },
    data: { role }
  });
  await logAudit(admin.id, "User", user.id, "SET_ROLE:" + role);
  return res.json({ ok: true });
}
