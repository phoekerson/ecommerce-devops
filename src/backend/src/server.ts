import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDatabase, sequelize } from "./config/database";
import { logger } from "./config/logger";
import { setupSwagger } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import { errorHandler, AppError } from "./middlewares/errorHandler";
import "./models";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true
  })
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api", apiLimiter);

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use((_req, _res, next) => next(new AppError("Route not found", 404)));
app.use(errorHandler);

export const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      logger.info("Database synced with alter:true");
    } else {
      await sequelize.sync();
      logger.info("Database synced");
    }
    app.listen(port, () => logger.info(`Server started on port ${port}`));
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
};

export { app };

if (process.env.NODE_ENV !== "test") {
  void start();
}
