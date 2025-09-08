import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { logAudit } from "../utils/audit";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: Role;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role ?? "student" },
    });

    // Use the corrected function name: generateToken
    const token = generateToken({ userId: user.id, role: user.role });

    // We can log the audit after sending the response so the user doesn't have to wait
    res.status(201).json({ token });
    await logAudit(user.id, "User", user.id, "REGISTER");

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Use the corrected function name: generateToken
    const token = generateToken({ userId: user.id, role: user.role });

    res.json({ token });
    await logAudit(user.id, "User", user.id, "LOGIN");
    
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
}