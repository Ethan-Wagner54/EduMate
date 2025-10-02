import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
// import messageRoutes from "./routes/messages"; // Commented out for demo - contains future messaging endpoints
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
import moduleRoutes from "./routes/modules";
// New API routes
import dashboardRoutes from "./routes/dashboard";
import conversationRoutes from "./routes/conversations";
import sessionHistoryRoutes from "./routes/sessionHistory";
// When ready to enable messaging, uncomment the line above and the route below
// import messageApiRoutes from "./routes/messageRoutes"; // New comprehensive messaging API
import { requestLogger } from "./middleware/requestLogger";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
// app.use("/messages", messageRoutes); // Commented out for demo
// app.use("/api/messaging", messageApiRoutes); // Uncomment when ready for full messaging API
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/modules", moduleRoutes);
// New API routes
app.use("/dashboard", dashboardRoutes);
app.use("/conversations", conversationRoutes);
app.use("/session-history", sessionHistoryRoutes);

export default app;
