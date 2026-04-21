import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { Product } from "../models/Product";
import { AppError } from "../middlewares/errorHandler";

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const offset = (page - 1) * limit;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const where: Record<string | symbol, unknown> = {};
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows, count } = await Product.findAndCountAll({ where, limit, offset, order: [["id", "DESC"]] });
    res.json({ data: rows, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) return next(new AppError("Product not found", 404));
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

    const product = await Product.findByPk(Number(req.params.id));
    if (!product) return next(new AppError("Product not found", 404));
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) return next(new AppError("Product not found", 404));
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
