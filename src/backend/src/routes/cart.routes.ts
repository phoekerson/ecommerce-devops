import { Router } from "express";
import { body, param } from "express-validator";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user cart
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticate,
  [body("productId").isInt({ min: 1 }), body("quantity").isInt({ min: 1 })],
  addToCart
);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Delete cart item
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, [param("id").isInt({ min: 1 })], removeFromCart);

export default router;
