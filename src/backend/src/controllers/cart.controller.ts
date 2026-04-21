import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { sequelize } from "../config/database";
import { AppError } from "../middlewares/errorHandler";
import { CartItem, Order, OrderItem, Product } from "../models";

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await CartItem.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Product }]
    });
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return next(new AppError("Product not found", 404));
    if (product.stock < quantity) return next(new AppError("Insufficient stock", 400));

    const existing = await CartItem.findOne({ where: { userId: req.user!.id, productId } });
    if (existing) {
      await existing.update({ quantity: existing.quantity + quantity });
      res.json(existing);
      return;
    }

    const item = await CartItem.create({ userId: req.user!.id, productId, quantity });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user!.id } });
    if (!item) return next(new AppError("Cart item not found", 404));
    await item.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user!.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrderFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Product }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!cartItems.length) {
      await transaction.rollback();
      return next(new AppError("Cart is empty", 400));
    }

    let total = 0;
    for (const item of cartItems) {
      const product = item.get("Product") as Product | undefined;
      if (!product) {
        await transaction.rollback();
        return next(new AppError("Product missing in cart item", 400));
      }
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
      total += Number(product.price) * item.quantity;
    }

    const order = await Order.create({ userId: req.user!.id, total: total.toFixed(2) }, { transaction });

    for (const item of cartItems) {
      const product = item.get("Product") as Product;
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        },
        { transaction }
      );
      await product.update({ stock: product.stock - item.quantity }, { transaction });
    }

    await CartItem.destroy({ where: { userId: req.user!.id }, transaction });
    await transaction.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [{ model: Product }] }]
    });
    res.status(201).json(fullOrder);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
