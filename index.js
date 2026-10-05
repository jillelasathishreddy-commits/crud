import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

import userRoute from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import mutualFundRoutes from "./routes/mutualFundRoutes.js";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoute);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mutual-funds", mutualFundRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(" yes MongoDB Connected successfully");

    app.listen(process.env.PORT || 8000, () => {
      console.log("Server Running on  my port 8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });