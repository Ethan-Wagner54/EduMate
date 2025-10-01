console.log("Starting server.ts");

import { env } from "./config";
console.log("Loaded env");

import { logger } from "./utils/logger";
console.log("Loaded logger");

import app from "./app";
console.log("Loaded app");

app.listen(env.PORT, () => {
  logger.info("server_listen", { port: env.PORT });
  console.log(`Server is listening on port ${env.PORT}`);
});
