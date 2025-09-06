import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const token = header.substring("Bearer ".length);
    const payload = verifyJwt(token);
    (req as any).user = payload;
    return next();
  } 
  catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
