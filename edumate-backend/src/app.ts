import express from "express";
import cors from "cors";
// --- SWAGGER IMPORTS ---
import swaggerUi from 'swagger-ui-express';
import path from 'path';
// -----------------------
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import messageRoutes from "./routes/messages";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
import moduleRoutes from "./routes/modules";
// New API routes
import dashboardRoutes from "./routes/dashboard";
import conversationRoutes from "./routes/conversations";
import sessionHistoryRoutes from "./routes/sessionHistory";
import groupChatRoutes from "./routes/groupChat";
import messageApiRoutes from "./routes/messageRoutes";
import tutorDashboardRoutes from "./routes/tutorDashboard";
import progressRoutes from "./routes/progress";
import fileUploadRoutes from "./routes/fileUpload";
import studentTutorsRoutes from "./routes/studentTutors";
import { requestLogger } from "./middleware/requestLogger";
import { trackUserActivity } from "./middleware/activityTracker";

const app = express();

// Configure CORS to allow frontend requests
const allowedOrigins = [
	'http://localhost:5173', // Vite dev server default
	'http://localhost:5174', // Alternative Vite port
	'http://localhost:3001', // Alternative frontend port
	'http://127.0.0.1:5173',
	'http://127.0.0.1:5174',
	'https://edu-fe-group-fgdpfcffhsb9e4a4.southafricanorth-01.azurewebsites.net'
];

// Add production frontend URL if specified in environment
if (process.env.FRONTEND_URL) {
	allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
	origin: allowedOrigins,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(requestLogger);
app.use(trackUserActivity);

// --- SWAGGER DOCUMENTATION SETUP ---
// CRUCIAL PATH CALCULATION:
// This calculation assumes the compiled file is in 'dist/src/'
// We go up two levels ('..', '..') to reach the 'edumate-backend' root, then enter 'uploads'.
const swaggerDocPath = path.join(__dirname, '..', '..', 'uploads', 'swagger.json'); 

try {
    // Load the JSON file synchronously at server startup.
    // The file MUST be created by the 'npm run ci:build' command during deployment.
    const swaggerDocument = require(swaggerDocPath); 

    // Set up the route /api-docs to serve the Swagger UI.
    app.use(
        '/api-docs', 
        swaggerUi.serve, 
        swaggerUi.setup(swaggerDocument, { explorer: true, customSiteTitle: 'EduMate API Docs' })
    );

    console.log('Swagger UI is configured at /api-docs');

} catch (error) {
    // Use console.warn/error to log the failure in case the 'swagger.json' file is missing.
    // The app continues to run without the docs, which is acceptable for a non-critical feature.
    console.warn(`[WARN] Could not load swagger.json from ${swaggerDocPath}. API Docs will be unavailable.`);
    console.error(error);
}
// ----------------------------------------

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/messages", messageRoutes);
app.use("/api/messaging", messageApiRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/modules", moduleRoutes);
// New API routes
app.use("/dashboard", dashboardRoutes);
app.use("/tutor-dashboard", tutorDashboardRoutes);
app.use("/progress", progressRoutes);
app.use("/conversations", conversationRoutes);
app.use("/session-history", sessionHistoryRoutes);
app.use("/group-chats", groupChatRoutes);
app.use("/files", fileUploadRoutes);
app.use("/student-tutors", studentTutorsRoutes);

// Serve static files (uploaded attachments)
app.use('/uploads', express.static('uploads'));

export default app;