import { env } from "../config/env";

type LogLevel = "info" | "error" | "warn" | "debug";

function write(level: LogLevel, ...args: unknown[]) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === "info") {
    console.info(prefix, ...args);
  } else if (level === "error") {
    console.error(prefix, ...args);
  } else if (level === "warn") {
    console.warn(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

export const logger = {
  info: (...args: unknown[]) => write("info", ...args),
  error: (...args: unknown[]) => write("error", ...args),
  warn: (...args: unknown[]) => write("warn", ...args),
  debug: (...args: unknown[]) => {
    if (env.nodeEnv !== "production") {
      write("debug", ...args);
    }
  },
};
