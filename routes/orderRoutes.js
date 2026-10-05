import express from "express";

import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from "../controller/orderController.js";

import verifyToken from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  createOrder
);

router.get(
  "/user/:userId",
  verifyToken,
  getUserOrders
);

router.get(
  "/admin",
  verifyToken,
  adminMiddleware,
  getAllOrders
);

router.get(
  "/:id",
  verifyToken,
  getOrderById
);

router.put(
  "/:id/status",
  verifyToken,
  adminMiddleware,
  updateOrderStatus
);

router.put(
  "/:id/cancel",
  verifyToken,
  cancelOrder
);

router.delete(
  "/:id",
  verifyToken,
  adminMiddleware,
  deleteOrder
);

export default router;