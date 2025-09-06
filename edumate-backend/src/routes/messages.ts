import { Router } from "express";
import { auth } from "../middleware/auth";
import { sendMessage, listMyMessages } from "../controllers/messages.controller";

const router = Router();

router.get("/", auth, listMyMessages);
router.post("/", auth, sendMessage);

export default router;
