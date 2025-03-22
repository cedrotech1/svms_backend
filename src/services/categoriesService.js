import db from "../database/models/index.js";
const { Provinces, Districts, Sectors, Cells, Villages,Categories,Users,Posts,Notifications} = db;

export const createCategory = async (categoryData) => {
  try {
    return await Categories.create(categoryData);
  } catch (error) {
    throw new Error(`Error creating Category: ${error.message}`);
  }
};

export const checkExistingCategory = async (name) => {
  return await Categories.findOne({
    where: {
      name,
    },
  });
};



export const getAllCategories = async () => {
  try {
    const cards = await Categories.findAll();
    return cards;
  } catch (error) {
    console.error("Error fetching all cards with categories:", error);
    throw error;
  }
};

export const deleteOneCategory = async (id) => {
  const categoryToDelete = await Categories.findOne({ where: { id } });
  if (categoryToDelete) {
    await Categories.destroy({ where: { id } });
    return categoryToDelete;
  }
  return null;
};

export const updateOneCategory = async (id, category) => {
  const categoryToUpdate = await Categories.findOne({ where: { id, restaurent } });
  if (categoryToUpdate) {
    await Categories.update(category, { where: { id } });
    return category;
  }
  return null;
};


export const getOneCategoryWithDetails = async (id) => {
  try {
    const cards = await Categories.findByPk(id);

    return cards;
  } catch (error) {
    console.error("Error fetching all:", error);
    throw error;
  }
};



export const getcategory = async (id) => {
  const allcategory = await Categories.findAll({
    where: {
      id,
    
    }
 
  });
  return allcategory;
};

// activatecategory