import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getOrdersByCategory,
} from "../controller/categoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/create",
    authMiddleware,
    adminMiddleware,
    createCategory
);

router.get(
    "/list", verifyToken,
    authMiddleware,
    getCategories
);

router.get(
    "/:id/products", verifyToken,
    authMiddleware,
    getOrdersByCategory
);

router.get(
    "/:id", verifyToken,
    authMiddleware,
    getCategory
);

router.put(
    "/:id", verifyToken,
    authMiddleware,
    adminMiddleware,
    updateCategory
);

router.delete(
    "/:id",
    verifyToken,
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

export default router;