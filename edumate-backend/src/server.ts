import { env } from "./config";
import { logger } from "./utils/logger";
import app from "./app";

// SOCKET.IO INTEGRATION - ENABLED
import { createServer } from 'http';
import socketService from './services/socketService';

const server = createServer(app);
socketService.initialize(server);

const PORT = process.env.PORT || 3000; // never 5432
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

