import mongoose from "mongoose";

import Order from "../model/ordermodel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      shippingAddress,
      cartItems
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        message: "shippingAddress is required"
      });
    }

    if (
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid userId"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const orderItems = [];

    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const productId =
        cartItem.productId ||
        cartItem._id;

      const quantity = Number(
        cartItem.cartQuantity ||
        cartItem.quantity ||
        0
      );

      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          message: "Invalid product ID"
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          message: "Invalid cart quantity"
        });
      }

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message:
            `Product not found: ${productId}`
        });
      }

      if (product.status !== "active") {
        return res.status(400).json({
          message:
            `${product.name || "Product"} is inactive`
        });
      }

      if (
        Number(product.quantity) < quantity
      ) {
        return res.status(400).json({
          message:
            `Only ${product.quantity} items are available in stock for ${product.name || "Product"}`
        });
      }

      const price =
        Number(product.price);

      const itemTotal =
        price * quantity;

      orderItems.push({
        productId: product._id,
        name:
          product.name ||
          "Product",
        quantity: quantity,
        price: price,
        total: itemTotal
      });

      totalAmount += itemTotal;
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      shippingAddress:
        shippingAddress.trim()
    });

    for (const item of orderItems) {
      const product =
        await Product.findById(
          item.productId
        );

      if (product) {
        product.quantity =
          Number(product.quantity) -
          Number(item.quantity);

        await product.save();
      }
    }

    return res.status(201).json({
      message:
        "Order created successfully",
      order
    });

  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create order",
      error:
        error.message
    });
  }
};

export const getUserOrders = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid userId"
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const orders =
      await Order.find({
        userId
      }).sort({
        createdAt: -1
      });

    return res.status(200).json({
      message:
        "User orders fetched successfully",
      count:
        orders.length,
      orders
    });

  } catch (error) {
    console.error(
      "Get user orders error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch user orders",
      error:
        error.message
    });
  }
};

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({})
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      message:
        "All orders fetched successfully",
      count:
        orders.length,
      orders
    });

  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch all orders",
      error:
        error.message
    });
  }
};

export const getOrderById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({
      message:
        "Order fetched successfully",
      order
    });

  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch order",
      error:
        error.message
    });
  }
};

export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const { status } =
      req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "status is required"
      });
    }

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
        allowedStatuses
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      order.status === "cancelled"
    ) {
      return res.status(400).json({
        message:
          "Cancelled order cannot be updated"
      });
    }

    if (
      order.status === "delivered"
    ) {
      return res.status(400).json({
        message:
          "Delivered order cannot be updated"
      });
    }

    if (
      status === "cancelled"
    ) {
      return res.status(400).json({
        message:
          "Use the cancel order API to cancel an order"
      });
    }

    order.status =
      status;

    await order.save();

    return res.status(200).json({
      message:
        "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error(
      "Update status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update order status",
      error:
        error.message
    });
  }
};

export const cancelOrder = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      order.status !== "pending" &&
      order.status !== "confirmed"
    ) {
      return res.status(400).json({
        message:
          "Only pending or confirmed orders can be cancelled"
      });
    }

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.productId
        );

      if (product) {
        product.quantity =
          Number(product.quantity) +
          Number(item.quantity);

        await product.save();
      }
    }

    order.status =
      "cancelled";

    await order.save();

    return res.status(200).json({
      message:
        "Order cancelled successfully and stock restored",
      order
    });

  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel order",
      error:
        error.message
    });
  }
};

export const deleteOrder = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(400).json({
      message:
        "Orders cannot be deleted because order history must be preserved"
    });

  } catch (error) {
    console.error(
      "Delete order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to process delete request",
      error:
        error.message
    });
  }
};