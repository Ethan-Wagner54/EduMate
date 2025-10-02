console.log("Starting server.ts");

import { createServer } from 'http';
import { env } from "./config";
import { logger } from "./utils/logger";
import app from "./app";
import socketService from './services/socketService';

console.log("Loaded app and services");

const server = createServer(app);
socketService.initialize(server);

server.listen(env.PORT, () => {
  logger.info("server_listen", { port: env.PORT, socketIO: true });
  console.log(`Server with Socket.IO is listening on port ${env.PORT}`);
});