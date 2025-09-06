import { Request, Response } from "express";
import { prisma } from "../db";
import { logAudit } from "../utils/audit";

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export async function listSessions(req: Request, res: Response) {
  try {
    const { module, tutorId } = req.query as { module?: string; tutorId?: string };
    const where: any = {};

    if (module) where.module = { code: module };
    if (tutorId) where.tutorId = Number(tutorId);

    const sessions = await prisma.session.findMany({
      where,
      include: { module: true, tutor: { select: { id: true, name: true } }, _count: { select: { enrollments: true } } },
      orderBy: { startTime: "asc" }
    });
    return res.json(sessions);
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to list sessions" });
  }
}

export async function createSession(req: Request, res: Response) {
  try {
    const user = (req as any).user as { id:number; role:"tutor"|"admin"|"student" };
    const { moduleId, startTime, endTime, location, capacity, status } = req.body;

    if (!moduleId || !startTime || !endTime) return res.status(400).json({ error: "Missing required fields" });
    // Prevent overlapping sessions for the same tutor
    const existing = await prisma.session.findMany({ where: { tutorId: user.id } });
    const s = new Date(startTime); const e = new Date(endTime);

    if (existing.some(x => overlaps(s, e, x.startTime, x.endTime))) {
      return res.status(409).json({ error: "Overlapping session exists for this tutor" });
    }
    const session = await prisma.session.create({
      data: { tutorId: user.id, moduleId: Number(moduleId), startTime: s, endTime: e, location, capacity, status }
    });
    await logAudit(user.id, "Session", session.id, "CREATE");
    return res.status(201).json(session);
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create session" });
  }
}

export async function joinSession(req: Request, res: Response) {
  try {
    const user = (req as any).user as { id:number; role:"student"|"tutor"|"admin" };
    const sessionId = Number(req.params.id);
    const target = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!target) return res.status(404).json({ error: "Session not found" });

    // Prevent student from joining overlapping sessions
    const mySessions = await prisma.session.findMany({
      where: { enrollments: { some: { studentId: user.id, status: "joined" } } }
    });
    if (mySessions.some(s => s.id !== sessionId && (target.startTime < s.endTime && target.endTime > s.startTime))) {
      return res.status(409).json({ error: "You are already in a session at that time" });
    }

    // Optional capacity check
    const count = await prisma.enrollment.count({ where: { sessionId, status: "joined" } });
    if (target.capacity != null && count >= target.capacity) {
      return res.status(409).json({ error: "Session is full" });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { sessionId_studentId: { sessionId, studentId: user.id } },
      update: { status: "joined" },
      create: { sessionId, studentId: user.id, status: "joined" }
    });
    await logAudit(user.id, "Enrollment", enrollment.id, "JOIN");
    return res.json({ ok: true });
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to join session" });
  }
}

export async function leaveSession(req: Request, res: Response) {
  try {
    const user = (req as any).user as { id:number };
    const sessionId = Number(req.params.id);
    await prisma.enrollment.update({
      where: { sessionId_studentId: { sessionId, studentId: user.id } },
      data: { status: "cancelled" }
    });
    await logAudit(user.id, "Enrollment", sessionId, "LEAVE");
    return res.json({ ok: true });
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to leave session" });
  }
}
