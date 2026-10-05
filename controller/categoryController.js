import mongoose from "mongoose";
import Category from "../model/categoryModel.js";
import Order from "../model/orderModel.js";



export const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    
    if (!status) {
      return res.status(400).json({
        message: "Category status is required",
      });
    }

    
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive",
      });
    }

    
    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    
    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      status,
    });

    return res.status(201).json({
      message: "Category Created Successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




export const getCategories = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          message: "Status must be active or inactive",
        });
      }

      filter.status = status;
    }

    const categories = await Category.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Category ID",
      });
    }

    
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Category name cannot be empty",
      });
    }

    
    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        message: "Status must be active or inactive",
      });
    }

    
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    
    if (name !== undefined) {
      const duplicateCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (duplicateCategory) {
        return res.status(409).json({
          message: "Category name already exists",
        });
      }
    }

    
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Category ID",
      });
    }

    
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    
    const orderCount = await Order.countDocuments({
      categoryId: id,
    });

    if (orderCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category because orders are assigned to it",
      });
    }

    
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};




export const getOrdersByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Category ID",
      });
    }

  
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    
    const orders = await Order.find({
      categoryId: id,
    });

    return res.status(200).json({
      category: category.name,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};