import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/product.controller";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products with pagination and filters
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category").optional().isString(),
    query("search").optional().isString()
  ],
  getProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 */
router.get("/:id", [param("id").isInt({ min: 1 })], getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  [
    body("name").notEmpty(),
    body("description").notEmpty(),
    body("price").isDecimal(),
    body("imageUrl").optional().isURL(),
    body("stock").isInt({ min: 0 }),
    body("category").notEmpty()
  ],
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin)
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("name").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("price").optional().isDecimal(),
    body("imageUrl").optional().isURL(),
    body("stock").optional().isInt({ min: 0 }),
    body("category").optional().notEmpty()
  ],
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin)
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, authorizeAdmin, [param("id").isInt({ min: 1 })], deleteProduct);

export default router;
