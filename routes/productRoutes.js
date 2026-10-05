import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controller/productController.js";

import verifyToken from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();


router.get("/",  getProducts);
router.get("/:id",  getProduct);

router.post("/create", verifyToken, adminMiddleware, createProduct);
router.put("/update/:id", verifyToken, adminMiddleware, updateProduct);
router.delete("/delete/:id", verifyToken, adminMiddleware, deleteProduct);

export default router;