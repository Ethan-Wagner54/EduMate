import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { listSessions, createSession, joinSession, leaveSession } from "../controllers/sessions.controller";

const router = Router();

router.get("/", auth, listSessions);
router.post("/", auth, requireRole("tutor", "admin"), createSession);
router.post("/:id/join", auth, requireRole("student"), joinSession);
router.post("/:id/leave", auth, requireRole("student"), leaveSession);

export default router;
