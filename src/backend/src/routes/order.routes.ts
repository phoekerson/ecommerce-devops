import { Router } from "express";
import { createOrderFromCart, getOrders } from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user orders
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, getOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order from cart
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticate, createOrderFromCart);

export default router;
