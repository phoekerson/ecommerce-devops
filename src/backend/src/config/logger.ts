import { createLogger, format, transports } from "winston";

const isDev = process.env.NODE_ENV !== "production";

export const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}] ${stack ?? message}`;
    })
  ),
  transports: [new transports.Console()]
});
