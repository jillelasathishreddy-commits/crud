import express from "express";

import {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
  clearCart
} from "../controller/cartController.js";

import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);

router.get("/:userId", verifyToken, getCart);

router.put("/:id", verifyToken, updateCart);

router.delete("/:id", verifyToken, removeCartItem);

router.delete("/clear/:userId", verifyToken, clearCart);

export default router;