import {
  createCategory,
  getAllCategories,
  deleteOneCategory,
  getOneCategoryWithDetails,
  updateOneCategory,

} from "../services/categoriesService.js";

export const addCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, you are not a  admin",
      });
    }

    const newCategory = await createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      Category: newCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const CategoryWithAllController = async (req, res) => {
  try {
    let data = await getAllCategories();
    if (!data) {
      return res.status(404).json({
        message: "Categories not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: data,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const deleteOneCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, you are not superadmin",
      });
    }

    const deletedCategory = await deleteOneCategory(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      Category: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const updateOneCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, you are not system admin",
      });
    }

    // req.body.name = req.body.name.toUpperCase();
    
    const updatedCategory = await updateOneCategory(req.params.id,req.body);
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      Category: updatedCategory,
    });
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const getOneCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getOneCategoryWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

