import mongoose from "mongoose";

import Cart from "../model/cartmodel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";



export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid productId",
      });
    }

    

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

  

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    
    if (
      product.status &&
      product.status !== "active"
    ) {
      return res.status(400).json({
        message: "Product is inactive",
      });
    }

    
    if (
      Number(quantity) >
      Number(product.quantity)
    ) {
      return res.status(400).json({
        message: `Only ${product.quantity} items are available in stock`,
      });
    }

    const price = Number(product.price);

    

    let cart = await Cart.findOne({
      userId,
      productId,
    });

    if (cart) {
      const newQuantity =
        Number(cart.quantity) +
        Number(quantity);

      if (
        newQuantity >
        Number(product.quantity)
      ) {
        return res.status(400).json({
          message: `Only ${product.quantity} items are available in stock`,
        });
      }

      cart.quantity = newQuantity;
      cart.price = price;

      await cart.save();

      const itemTotal =
        Number(cart.quantity) * price;

      return res.status(200).json({
        message:
          "Product quantity updated successfully",

        cart: {
          cartId: cart._id,

          userId: cart.userId,

          productId: product._id,

          productDetails: {
            _id: product._id,

            product:
              product.product,

            price:
              product.price,

            ram:
              product.ram,

            categoryId:
              product.categoryId,

            availableQuantity:
              product.quantity,

            status:
              product.status || "active",

            createdAt:
              product.createdAt,

            updatedAt:
              product.updatedAt,
          },

          cartQuantity:
            cart.quantity,

          price:
            cart.price,

          itemTotal,
        },
      });
    }

    

    cart = await Cart.create({
      userId,
      productId,
      quantity: Number(quantity),
      price,
    });

    const itemTotal =
      Number(cart.quantity) *
      Number(cart.price);

    return res.status(201).json({
      message:
        "Product added to cart successfully",

      cart: {
        cartId: cart._id,

        userId: cart.userId,

        productId: product._id,

        productDetails: {
          _id: product._id,

          product:
            product.product,

          price:
            product.price,

          ram:
            product.ram,

          categoryId:
            product.categoryId,

          availableQuantity:
            product.quantity,

          status:
            product.status || "active",

          createdAt:
            product.createdAt,

          updatedAt:
            product.updatedAt,
        },

        cartQuantity:
          cart.quantity,

        price:
          cart.price,

        itemTotal,
      },
    });
  } catch (error) {
    console.error(
      "Add to cart error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add product to cart",

      error:
        error.message,
    });
  }
};




export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    

    const cartItems =
      await Cart.find({
        userId,
      });

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      return res.status(200).json({
        message: "Cart is empty",
        totalItems: 0,
        items: [],
        grandTotal: 0,
      });
    }

    const items = [];



    for (const cartItem of cartItems) {
      const product =
        await Product.findById(
          cartItem.productId
        );

      if (!product) {
        continue;
      }

      const itemTotal =
        Number(cartItem.quantity) *
        Number(cartItem.price);

      items.push({
        cartId:
          cartItem._id,

        userId:
          cartItem.userId,

        productId:
          product._id,

        productDetails: {
          _id:
            product._id,

          product:
            product.product,

          price:
            product.price,

          ram:
            product.ram,

          categoryId:
            product.categoryId,

          availableQuantity:
            product.quantity,

          status:
            product.status || "active",

          createdAt:
            product.createdAt,

          updatedAt:
            product.updatedAt,
        },

        cartQuantity:
          cartItem.quantity,

        price:
          cartItem.price,

        itemTotal,
      });
    }

    

    const grandTotal =
      items.reduce(
        (total, item) =>
          total +
          Number(item.itemTotal),
        0
      );

    
    const totalQuantity =
      items.reduce(
        (total, item) =>
          total +
          Number(item.cartQuantity),
        0
      );

    return res.status(200).json({
      message:
        "Cart fetched successfully",

      totalItems:
        items.length,

      totalQuantity,

      items,

      grandTotal,
    });
  } catch (error) {
    console.error(
      "Get cart error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch cart",

      error:
        error.message,
    });
  }
};




export const getCartItemById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid cart ID",
      });
    }

    const cart =
      await Cart.findById(id);

    if (!cart) {
      return res.status(404).json({
        message:
          "Cart item not found",
      });
    }

    const product =
      await Product.findById(
        cart.productId
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const itemTotal =
      Number(cart.quantity) *
      Number(cart.price);

    return res.status(200).json({
      cartId:
        cart._id,

      userId:
        cart.userId,

      productId:
        product._id,

      productDetails: {
        _id:
          product._id,

        product:
          product.product,

        price:
          product.price,

        ram:
          product.ram,

        categoryId:
          product.categoryId,

        availableQuantity:
          product.quantity,

        status:
          product.status || "active",

        createdAt:
          product.createdAt,

        updatedAt:
          product.updatedAt,
      },

      cartQuantity:
        cart.quantity,

      price:
        cart.price,

      itemTotal,
    });
  } catch (error) {
    console.error(
      "Get cart item error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch cart item",

      error:
        error.message,
    });
  }
};



export const updateCart = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { quantity } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid cart ID",
      });
    }

    if (
      !quantity ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be greater than 0",
      });
    }

    const cart =
      await Cart.findById(id);

    if (!cart) {
      return res.status(404).json({
        message:
          "Cart item not found",
      });
    }

    const product =
      await Product.findById(
        cart.productId
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    if (
      Number(quantity) >
      Number(product.quantity)
    ) {
      return res.status(400).json({
        message: `Only ${product.quantity} items are available in stock`,
      });
    }

    cart.quantity =
      Number(quantity);

    cart.price =
      Number(product.price);

    await cart.save();

    const itemTotal =
      Number(cart.quantity) *
      Number(cart.price);

    return res.status(200).json({
      message:
        "Cart updated successfully",

      cart: {
        cartId:
          cart._id,

        userId:
          cart.userId,

        productId:
          product._id,

        productDetails: {
          _id:
            product._id,

          product:
            product.product,

          price:
            product.price,

          ram:
            product.ram,

          categoryId:
            product.categoryId,

          availableQuantity:
            product.quantity,

          status:
            product.status || "active",
        },

        cartQuantity:
          cart.quantity,

        price:
          cart.price,

        itemTotal,
      },
    });
  } catch (error) {
    console.error(
      "Update cart error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update cart",

      error:
        error.message,
    });
  }
};




export const removeCartItem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid cart ID",
      });
    }

    const cart =
      await Cart.findByIdAndDelete(id);

    if (!cart) {
      return res.status(404).json({
        message:
          "Cart item not found",
      });
    }

    return res.status(200).json({
      message:
        "Cart item removed successfully",

      cartId:
        cart._id,
    });
  } catch (error) {
    console.error(
      "Remove cart item error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to remove cart item",

      error:
        error.message,
    });
  }
};



export const clearCart = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid userId",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const result =
      await Cart.deleteMany({
        userId,
      });

    return res.status(200).json({
      message:
        "Cart cleared successfully",

      deletedItems:
        result.deletedCount,
    });
  } catch (error) {
    console.error(
      "Clear cart error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to clear cart",

      error:
        error.message,
    });
  }
};