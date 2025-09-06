import { Request, Response } from "express";
import { prisma } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { signJwt } from "../utils/jwt";
import { logAudit } from "../utils/audit";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body as { name:string; email:string; password:string; role?: "student"|"tutor"|"admin"; };
    if (!name || !email || !password) 
      return res.status(400).json({ error: "Missing required fields" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) 
      return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role ?? "student" }
    });

    await logAudit(user.id, "User", user.id, "REGISTER");
    const token = signJwt({ id: user.id, role: user.role as any });

    return res.status(201).json({ token });
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email:string; password:string; };
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) 
      return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.passwordHash);

    if (!ok) 
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt({ id: user.id, role: user.role as any });
    await logAudit(user.id, "User", user.id, "LOGIN");
    return res.json({ token });
  } 
  catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
}
