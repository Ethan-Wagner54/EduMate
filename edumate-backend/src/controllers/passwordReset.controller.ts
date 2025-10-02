import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password";
import { logger } from "../utils/logger";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generate a secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Request password reset
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security, always return success even if email doesn't exist
    if (!user) {
      logger.info("password_reset_request_invalid_email", { email });
      return res.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In a real application, you would send an email here
    // For demo purposes, we'll just log the reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
    
    logger.info("password_reset_requested", { 
      userId: user.id, 
      email, 
      resetLink // Remove this in production
    });

    // For demo purposes, include the reset link in the response
    // In production, remove this and only send via email
    res.json({ 
      message: "If an account with that email exists, we've sent a password reset link.",
      resetLink // Remove this in production
    });

  } catch (error) {
    logger.error("password_reset_request_failed", { 
      error: (error as any)?.message || String(error) 
    });
    return res.status(500).json({ error: "Password reset request failed" });
  }
}

// Reset password using token
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    logger.info("password_reset_completed", { userId: user.id });

    res.json({ message: "Password has been reset successfully" });

  } catch (error) {
    logger.error("password_reset_failed", { 
      error: (error as any)?.message || String(error) 
    });
    return res.status(500).json({ error: "Password reset failed" });
  }
}

// Verify reset token
export async function verifyResetToken(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(400).json({ 
        error: "Invalid or expired reset token",
        valid: false 
      });
    }

    res.json({ 
      message: "Reset token is valid",
      valid: true,
      email: user.email
    });

  } catch (error) {
    logger.error("token_verification_failed", { 
      error: (error as any)?.message || String(error) 
    });
    return res.status(500).json({ error: "Token verification failed" });
  }
}