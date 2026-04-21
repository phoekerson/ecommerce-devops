import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const requiredVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
for (const envKey of requiredVars) {
  if (!process.env[envKey]) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }
}

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? (msg) => logger.debug(msg) : false
  }
);

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  logger.info("Database connection established");
};
