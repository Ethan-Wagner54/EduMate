import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { listUsers, setUserRole } from "../controllers/admin.controller";

const router = Router();

router.get("/users", auth, requireRole("admin"), listUsers);
router.post("/users/role", auth, requireRole("admin"), setUserRole);

export default router;
