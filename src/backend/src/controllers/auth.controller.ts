import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../middlewares/errorHandler";

const signToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Missing JWT_SECRET", 500);
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { email, password, firstName, lastName } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError("Email already in use", 409));
    }

    const user = await User.create({ email, password, firstName, lastName });
    const token = signToken(user.id);

    res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    const token = signToken(user.id);
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: req.user?.toJSON() });
};
