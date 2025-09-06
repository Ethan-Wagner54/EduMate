import { Request, Response } from "express";
import { prisma } from "../db";
import { logAudit } from "../utils/audit";

function isTutorStudentPair(a: string, b: string) {
  const set = new Set([a, b]);
  return set.has("tutor") && set.has("student");
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const user = (req as any).user as { id:number; role:"student"|"tutor"|"admin" };
    const { recipientId, sessionId, content } = req.body as { recipientId:number; sessionId?:number; content:string; };

    if (!recipientId || !content) 
      return res.status(400).json({ error: "recipientId and content required" });

    const recipient = await prisma.user.findUnique({ where: { id: Number(recipientId) } });

    if (!recipient) 
      return res.status(404).json({ error: "Recipient not found" });

    if (!isTutorStudentPair(user.role, recipient.role)) {
      return res.status(403).json({ error: "Only tutor↔student messages are allowed" });
    }

    const msg = await prisma.message.create({
      data: {
        senderId: user.id,
        recipientId: Number(recipientId),
        sessionId: sessionId ?? null,
        content,
      },
    });
    await logAudit(user.id, "Message", msg.id, "SEND");
    return res.status(201).json(msg);
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to send message" });
  }
}

export async function listMyMessages(req: Request, res: Response) {
  try {
    const user = (req as any).user as { id:number };
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
      orderBy: { sentAt: "desc" },
    });
    return res.json(messages);
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to list messages" });
  }
}
