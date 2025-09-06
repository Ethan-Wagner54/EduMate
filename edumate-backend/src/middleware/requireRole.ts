import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: Array<"student"|"tutor"|"admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { id: number; role: "student"|"tutor"|"admin" } | undefined;
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
