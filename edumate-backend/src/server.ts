console.log("Starting server.ts");

import { env } from "./config";
console.log("Loaded env");

import { logger } from "./utils/logger";
console.log("Loaded logger");

import app from "./app";
console.log("Loaded app");

/*
 * SOCKET.IO INTEGRATION - READY FOR FUTURE USE
 * 
 * Uncomment the following lines when ready to enable real-time messaging:
 * 
 * import { createServer } from 'http';
 * import socketService from './services/socketService';
 * 
 * const server = createServer(app);
 * socketService.initialize(server);
 * 
 * server.listen(env.PORT, () => {
 *   logger.info("server_listen", { port: env.PORT, socketIO: true });
 *   console.log(`Server with Socket.IO is listening on port ${env.PORT}`);
 * });
 */

app.listen(env.PORT, () => {
  logger.info("server_listen", { port: env.PORT });
  console.log(`Server is listening on port ${env.PORT}`);
});
