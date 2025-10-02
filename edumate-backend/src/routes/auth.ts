import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { 
  requestPasswordReset, 
  resetPassword, 
  verifyResetToken 
} from "../controllers/passwordReset.controller";
const router = Router();

router.post("/register", register);
router.post("/login", login);

// Password reset routes
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

export default router;
