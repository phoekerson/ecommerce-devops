import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { User } from "../models/User";

interface TokenPayload extends JwtPayload {
  userId: number;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("Missing JWT_SECRET", 500);
    }

    const payload = jwt.verify(token, secret) as TokenPayload;
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return next(new AppError("Invalid token", 401));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorizeAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }
  next();
};
