import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import messageRoutes from "./routes/messages";
import adminRoutes from "./routes/admin";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);

export default app;
