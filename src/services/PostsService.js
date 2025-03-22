import { Sequelize, where } from 'sequelize';
import db from "../database/models/index.js";
// const Post = db["Posts"];
const { Provinces, Districts, Sectors, Cells, Villages, Categories, Users, Posts, Notifications,Comments } = db;

export const createComment = async (data) => {
  try {
    const newComment = await Comments.create(data);
    return newComment;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const getOnePostWithDetails = async (id) => {
  try {
    const info = await Posts.findByPk(id, {
      where: { id },
      include: [
        {
          model: Categories,
          as: "category",
        },
        {
          model: Provinces,
          as: "province",
        },
        {
          model: Districts,
          as: "district",
        },
        {
          model: Sectors,
          as: "sector",
        },
        {
          model: Cells,
          as: "cell",
        },
        {
          model: Villages,
          as: "village",
        },
        {
          model: Users,
          as: "user",
        },
        {
          model: Comments,
          as: "comments",
          include: [
            {
              model: Users,
              as: "user", 
              attributes: ["id", "firstname", "lastname", "email", "image"], 
            },
          ],
          
        }
      ],

    });

    return info;
  } catch (error) {
    console.error("Error fetching all restaurants with users:", error);
    throw error;
  }
};

export const getAllPostes_forlocation = async (location,location_id,statusArray) => {
  try {
    const Info = await Posts.findAll({
      where: { [location]: location_id,status: statusArray },
      include: [
        {
          model: Categories,
          as: "category",
        },
        {
          model: Provinces,
          as: "province",
        },
        {
          model: Districts,
          as: "district",
        },
        {
          model: Sectors,
          as: "sector",
        },
        {
          model: Cells,
          as: "cell",
        },
        {
          model: Villages,
          as: "village",
        },
        {
          model: Users,
          as: "user",
        },
        {
          model: Comments,
          as: "comments",
          include: [
            {
              model: Users,
              as: "user", 
              attributes: ["id", "firstname", "lastname", "email", "image"], 
            },
          ],
          
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const getAllPostes = async () => {
  try {
    const Info = await Posts.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Categories,
          as: "category",
        },
        {
          model: Provinces,
          as: "province",
        },
        {
          model: Districts,
          as: "district",
        },
        {
          model: Sectors,
          as: "sector",
        },
        {
          model: Cells,
          as: "cell",
        },
        {
          model: Villages,
          as: "village",
        },
        {
          model: Users,
          as: "user",
        },
        {
          model: Comments,
          as: "comments",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};




export const createPost = async (PostData) => {
  try {
    return await Posts.create(PostData);
  } catch (error) {
    throw new Error(`Error creating Post: ${error.message}`);
  }
};

export const checkExistingPost = async (title) => {
  return await Posts.findOne({
    where: {
      title,
    },
  });
};

// export const getAllPostes = async () => {
//   return await PostModel.findAll();
// };

export const deleteOnePost = async (id) => {
  const restToDelete = await Posts.findOne({ where: { id } });
  if (restToDelete) {
    await Posts.destroy({ where: { id } });
    return restToDelete;
  }
  return null;
};


export const updateOne = async (id, data) => {
  const dataToUpdate = await Posts.findOne({ where: { id } });
  if (dataToUpdate) {
    await Posts.update(data, { where: { id } });
    return data;
  }
  return null;
};

export const approve = async (id,status) => {
  const restoToUpdate = await Posts.findOne({ where: { id } });
  if (restoToUpdate) {
    const updatedone = await Posts.update({ status: status }, { where: { id } });
    return updatedone;
  }
  return null;
};

export const reject = async (id,status) => {
  const restoToUpdate = await Posts.findOne({ where: { id } });
  if (restoToUpdate) {
    await Posts.update({ status: status }, { where: { id } });
    return restoToUpdate;
  }
  return null;
};

