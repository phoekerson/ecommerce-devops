import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const appError = error instanceof AppError ? error : new AppError(error.message || "Internal server error");
  logger.error(appError.stack || appError.message);
  res.status(appError.statusCode).json({ message: appError.message });
};
