import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Backend running on http://localhost:${env.port}`);
});
