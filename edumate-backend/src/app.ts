import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
import moduleRoutes from "./routes/modules";
import dashboardRoutes from "./routes/dashboard";
import conversationRoutes from "./routes/conversations";
import sessionHistoryRoutes from "./routes/sessionHistory";
// This is the import for the new messaging API
import messageApiRoutes from "./routes/messageRoutes"; 
import { requestLogger } from "./middleware/requestLogger";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ ok: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/session-history", sessionHistoryRoutes);

// This line enables all the messaging endpoints
app.use("/api/messaging", messageApiRoutes); 

export default app;