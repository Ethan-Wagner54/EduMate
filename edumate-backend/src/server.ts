import { env } from "./config";
import { logger } from "./utils/logger";
import app from "./app";

// SOCKET.IO INTEGRATION - ENABLED
import { createServer } from 'http';
import socketService from './services/socketService';

const server = createServer(app);
socketService.initialize(server);

server.listen(env.PORT, () => {
  logger.info("server_listen", { port: env.PORT, socketIO: true });
});
