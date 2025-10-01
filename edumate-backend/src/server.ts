import app from "./app";
import { env } from "./config";
import { logger } from "./utils/logger";

app.listen(env.PORT, () => {
  logger.info("server_listen", { port: env.PORT });
});
