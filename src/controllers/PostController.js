// PostController.js
import {
  createPost,
  getAllPostes,
  deleteOnePost,
  checkExistingPost,
  getOnePostWithDetails,
  updateOne,
  approve,
  reject,
  getAllPostes_forlocation,
  createComment
  

} from "../services/PostsService.js";
import imageUploader from "../helpers/imageUplouder.js";

import {
  getUser,
} from "../services/userService.js";
import {
  getOneCategoryWithDetails
} from "../services/categoriesService.js";
import Email from "../utils/mailer.js";
import {
  createNotification,
} from "../services/NotificationService";



import db from "../database/models/index.js";
const { Users } = db;

export const addPostController = async (req, res) => {
  try {
    req.body.userID = req.user.id;
    let role = req.user.role;
    const { province_id, district_id, sector_id, cell_id, village_id } = req.user;

    req.body.province_id = province_id;
    req.body.district_id = district_id;
    req.body.sector_id = sector_id;
    req.body.cell_id = cell_id;
    req.body.village_id = village_id;

    const category = await getOneCategoryWithDetails(req.body.categoryID);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let image = null;
    if (req.files && req.files.image) {
      try {
        const uploadedImage = await imageUploader(req);
        if (!uploadedImage || !uploadedImage.url) {
          throw new Error('Upload failed or image URL missing');
        }
        image = uploadedImage.url;
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    req.body.image = image;

    const existingPost = await checkExistingPost(req.body.title);
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: "Post detail exists",
      });
    }
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Assign status based on role
    if (role === "admin" || role === "province_leader" || role === "district_leader" || role === "sector_leader") {
      req.body.status = 'approved';
    } else if (role === "cell_leader") {
      req.body.status = 'approvedbycell';
    } else if (role === "village_leader") {
      if (!province_id || !district_id || !sector_id || !cell_id || !village_id) {
        return res.status(400).json({
          success: false,
          message: "Please provide full location",
        });
      }
      req.body.status = 'approved';
    }

    const newPost = await createPost(req.body);

    let claim = {
      message: "New post has been added in system for more details go in system to new!",
      posttitle: newPost.title,
      postdescription: newPost.description,
    };

    let targetUsers = [];

    // Determine who to notify based on the role of the user who created the post
    if (role === 'village_leader') {
      // Notify cell leaders within the village
      targetUsers = await Users.findAll({
        where: {
          role: 'cell_leader',
          cell_id: cell_id,
        },
      });
    } else if (role === 'cell_leader') {
      // Notify sector leader within the same sector
      targetUsers = await Users.findAll({
        where: {
          role: 'sector_leader',
          sector_id: sector_id,
        },
      });
    } else if (role === 'sector_leader') {
      // Notify district leader within the same district
      targetUsers = await Users.findAll({
        where: {
          role: 'district_leader',
          district_id: district_id,
        },
      });
    } else if (role === 'district_leader') {
      // Notify province leader within the same province
      targetUsers = await Users.findAll({
        where: {
          role: 'province_leader',
          province_id: province_id,
        },
      });
    }

    // Send notifications to the target users
    if (targetUsers.length > 0) {
      for (const user of targetUsers) {
        console.log("Sending notification to user:", user.email);
        await createNotification({
          userID: user.id,
          title: "New Post Alert",
          message: `A new post has been created in your region. Check it out!`,
          type: 'Alert',
          isRead: false,
        });

        
        const users = await getUser(user.id);
        await new Email(users, claim).sendNotification();
      }
    } else {
      console.log("No users found to notify for role:", role);
    }

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });

  } catch (error) {
    console.error("Error in addPostController:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};



// export const addPostController = async (req, res) => {
//   try {
//    req.body.userID=req.user.id;
//    let role=req.user.role;

//    const { province_id, district_id, sector_id, cell_id, village_id } = req.user;
//     req.body.province_id=province_id;
//     req.body.district_id=district_id;
//     req.body.sector_id=sector_id;
//     req.body.cell_id=cell_id;
//     req.body.village_id=village_id;

//     const data = await getOneCategoryWithDetails(req.body.categoryID);
//     if (!data) {
//       return res.status(404).json({
//         message: "Category not found",
//       });
//     }
//     let image; 
//     if (req.files && req.files.image) {
//       try {
//         image = await imageUploader(req);
//         if (!image || !image.url) {
//           throw new Error('Upload failed or image URL missing');
//         }
//         req.body.image = image.url;
//         console.log(req.body.image)
//       } catch (error) {
//         console.error('Error uploading image:', error);
//         // Handle error appropriately
//       }
//     }else{
//       req.body.image = null;
//     }

//     const existingpost = await checkExistingPost(req.body.title);
//     if (existingpost) {
//       return res.status(400).json({
//         success: false,
//         message: "post detail exists",
//       });
//     }
//     if (!req.body.title) {
//       return res.status(400).json({
//         success: false,
//         message: "title is required",
//       });
//     }

//     // role based status
//     if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
//       req.body.status='approved'

//     }

//     if (role=="cell_leader") {
//       req.body.status='approvedbycell'
//     }
//     if (role=="village_leader") {

//         if (!req.body.province_id || req.body.district_id === "" || req.body.sector_id === "" || req.body.cell_id === "" || req.body.village_id === "") {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide full location",
//     });
//   }
//       req.body.status='approvedbyvillage'
//     }

  

//     let claim = {
//       message: "",
//       missiontitle: "",
//       postdescription: "",
//     };
    
//     // Assign values to properties
//     claim.message = "new post has been added in system for more details go in system to new !";
//     claim.posttitle = newpost.title;
//     claim.postdescription = newpost.description;

    
//     const newpost = await createPost(req.body);
//     await new Email(user,claim).sendNotification();
//      const notification = await createNotification({ userID:user.id,title:"New post", message:"new post has been added in system", type:'Alert', isRead: false });
      
    
//      if (role=="district_leader") {
//       // send notification to province leader
//     }


//     if (role=="sector_leader") {
//       // send notification to district leader
//     }

//     if (role=="cell_leader") {
//       // send notification to sector leader

//     }
//     if (role=="village_leader") {
//       // send notification to cell leader
   
//     }


//     return res.status(201).json({
//       success: true,
//       message: "post created successfully",
//       post: newpost,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };




export const PostWithAllController = async (req, res) => {
  try {
    if (!req.user) {
      // If the user is not logged in, return all public posts
      const data = await getAllPostes(); // Adjust this function to return only public posts if needed
      return res.status(200).json({
        success: true,
        message: "Public posts retrieved successfully",
        data,
      });
    }
    const userID = req.user.id; // Get logged-in user's ID
    const role = req.user.role;
    const province_id = req.user.province_id;
    const district_id = req.user.district_id;
    const sector_id = req.user.sector_id;
    const cell_id = req.user.cell_id;
    const village_id = req.user.village_id;

    let data;
    
    let statusArray = []; // Define an array of statuses for filtering

    // Define status arrays based on roles
    if (role === "admin") {
      statusArray = ["approved", "rejected"]; // Admin sees all statuses
      data = await getAllPostes(statusArray);
    } else if (role === "province_leader") {
      statusArray = ["approved","rejected"];
      data = await getAllPostes_forlocation("province_id", province_id, statusArray);
    } else if (role === "district_leader") {
      statusArray = ["approved","rejected"];
      data = await getAllPostes_forlocation("district_id", district_id, statusArray);
    } else if (role === "sector_leader") {
      statusArray = ["approvedbycell","rejectedbysector","approved","rejected"];
      data = await getAllPostes_forlocation("sector_id", sector_id, statusArray);
    } else if (role === "cell_leader") {
      statusArray = ["approvedbyvillage","approvedbycell","rejectedbycell","approvedbysector","rejectedbysector","approved","rejected"];
      data = await getAllPostes_forlocation("cell_id", cell_id, statusArray);
    } else if (role === "village_leader") {
      statusArray = ["approved","pending","approvedbycell","rejectedbycell","approvedbyvillage","rejectedbyvillage","rejectedbysector","approvedbysector","rejected"];
      data = await getAllPostes_forlocation("village_id", village_id, statusArray);
    
  } else if (role === "citizen") {
    statusArray = ["approved"];
    data = await getAllPostes_forlocation("village_id", village_id, statusArray);
  }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No post details found for the logged-in user",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "post details retrieved successfully",
      data,
      // user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const getOnePostController = async (req, res) => {


  try {
    if (!req.user) {
      // If the user is not logged in, return all public posts
      const data = await getAllPostes(); // Adjust this function to return only public posts if needed
      return res.status(200).json({
        success: true,
        message: "Public posts retrieved successfully",
        data,
      });
    }
    const { id } = req.params;
    const userID = req.user.id; // Get logged-in user's ID

    const data = await getOnePostWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "post detail not found",
        data:[],
      });
    }
    return res.status(200).json({
      success: true,
      message: "post detail retrieved successfully",
      data,
      // user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

// export const deleteOnePostController = async (req, res) => {

//   try {
//     const { id } = req.params;
//     const userID = req.user.id; 
//     const data = await getOnePostWithDetails(id);
//     if (!data) {
//       return res.status(404).json({
//         message: "post detail not found",
//         data:[],
//       });
//     }
  

//     const Post = await deleteOnePost(req.params.id);
//     if (!Post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "Post deleted successfully",
//       Post,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something went wrong",
//       error,
//     });
//   }
// };


// export const approvePostController = async (req, res) => {
//   try {

//     const { id } = req.params;
//     const userID = req.user.id; // Get logged-in user's ID

//     const data = await getOnePostWithDetails(id);
//     if (!data) {
//       return res.status(404).json({
//         message: "post detail not found",
//         data:[],
//       });
//     }

//     if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
//       req.body.status='approved'
//     }

//     if (role=="cell_leader") {
//       req.body.status='approvedbycell'
//     }
//     if (role=="village_leader") {
//       req.body.status='approvedbyvillage'
//     }
   

//     const post = await approve(req.params.id,req.body.status);
//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "post not found",
        
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "post activated successfully",
//       post,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something went wrong",
//       error,
//     });
//   }
// };

// export const rejectPostController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userID = req.user.id; // Get logged-in user's ID

//     const data = await getOnePostWithDetails(id,userID);
//     if (!data) {
//       return res.status(404).json({
//         message: "post detail not found",
//         data:[],
//       });
//     }

//     if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
//       req.body.status='rejected'
//     }

//     if (role=="cell_leader") {
//       req.body.status='rejectedbycell'
//     }
//     if (role=="village_leader") {
//       req.body.status='rejectedbyvillage'
//     }
   

//     const post = await reject(req.params.id);
//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "post not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "post rejected successfully",
//       post
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something went wrong",
//       error,
//     });
//   }
// };


export const deleteOnePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const role = req.user.role; // Get logged-in user's role
    const { province_id, district_id, sector_id, cell_id, village_id } = req.user;

    const data = await getOnePostWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "Post detail not found",
        data: [],
      });
    }

    const post = await deleteOnePost(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Determine the target users for notification (both up and down)
    let targetUsers = [];
    if (role === 'village_leader') {
      // Notify cell leaders within the village
      targetUsers = await Users.findAll({ where: { role: 'cell_leader', village_id } });
    } else if (role === 'cell_leader') {
      // Notify sector leader within the same sector
      targetUsers = await Users.findAll({ where: { role: 'sector_leader', sector_id } });
    } else if (role === 'sector_leader') {
      // Notify district leader within the same district
      targetUsers = await Users.findAll({ where: { role: 'district_leader', district_id } });
    } else if (role === 'district_leader') {
      // Notify province leader within the same province
      targetUsers = await Users.findAll({ where: { role: 'province_leader', province_id } });
    }

    // Notify down (for leaders at the lower levels)
    let downUsers = [];
    if (role === 'province_leader') {
      downUsers = await Users.findAll({ where: { role: 'district_leader', province_id } });
    } else if (role === 'district_leader') {
      downUsers = await Users.findAll({ where: { role: 'sector_leader', district_id } });
    } else if (role === 'sector_leader') {
      downUsers = await Users.findAll({ where: { role: 'cell_leader', sector_id } });
    } else if (role === 'cell_leader') {
      downUsers = await Users.findAll({ where: { role: 'village_leader', cell_id } });
    }

    // Send notifications to the target users
    const claim = {
      message: "A post has been deleted from the system. Check the system for more details.",
      posttitle: data.title,
    };

    const sendNotification = async (user) => {
      await createNotification({
        userID: user.id,
        title: "Post Deletion Alert",
        message: `A post has been deleted in your region. Check it out!`,
        type: 'Alert',
        isRead: false,
      });
    };

    // Notify target users (both up and down)
    const allUsers = [...targetUsers, ...downUsers];
    for (const user of allUsers) {
      await sendNotification(user,claim);
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const approvePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const role = req.user.role;
    const { province_id, district_id, sector_id, cell_id, village_id } = req.user;

    const data = await getOnePostWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "Post detail not found",
        data: [],
      });
    }

    let status = '';
    if (role === 'admin' || role === 'province_leader' || role === 'district_leader' || role === 'sector_leader') {
      status = 'approved';
    } else if (role === 'cell_leader') {
      status = 'approvedbycell';
    } else if (role === 'village_leader') {
      status = 'approved';
    }

    req.body.status = status;
    const post = await approve(id, status);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Determine the target users for notification (both up and down)
    let targetUsers = [];
    if (role === 'village_leader') {
      targetUsers = await Users.findAll({ where: { role: 'cell_leader', village_id } });
    } else if (role === 'cell_leader') {
      targetUsers = await Users.findAll({ where: { role: 'sector_leader', sector_id } });
    } else if (role === 'sector_leader') {
      targetUsers = await Users.findAll({ where: { role: 'district_leader', district_id } });
    } else if (role === 'district_leader') {
      targetUsers = await Users.findAll({ where: { role: 'province_leader', province_id } });
    }

    // Notify down (for leaders at the lower levels)
    let downUsers = [];
    if (role === 'province_leader') {
      downUsers = await Users.findAll({ where: { role: 'district_leader', province_id } });
    } else if (role === 'district_leader') {
      downUsers = await Users.findAll({ where: { role: 'sector_leader', district_id } });
    } else if (role === 'sector_leader') {
      downUsers = await Users.findAll({ where: { role: 'cell_leader', sector_id } });
    } else if (role === 'cell_leader') {
      downUsers = await Users.findAll({ where: { role: 'village_leader', cell_id } });
    }

    // Send notifications to the target users
    const claim = {
      message: "A post has been approved. Check the system for more details.",
      posttitle: data.title,
    };

    const sendNotification = async (user) => {
      await createNotification({
        userID: user.id,
        title: "Post Approval Alert",
        message: `A post has been approved in your region. Check it out!`,
        type: 'Alert',
        isRead: false,
      });
    };

    // Notify target users (both up and down)
    const allUsers = [...targetUsers, ...downUsers];
    for (const user of allUsers) {
      await sendNotification(user,claim);
    }
    console.log(req.user)

    return res.status(200).json({
      success: true,
      message: "Post approved successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const rejectPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const role = req.user.role;
    const { province_id, district_id, sector_id, cell_id, village_id } = req.user;

    const data = await getOnePostWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "Post detail not found",
        data: [],
      });
    }

    let status = '';
    if (role === 'admin' || role === 'province_leader' || role === 'district_leader' || role === 'sector_leader') {
      status = 'rejected';
    } else if (role === 'cell_leader') {
      status = 'rejectedbycell';
    } else if (role === 'village_leader') {
      status = 'rejectedbyvillage';
    }

    req.body.status = status;
    const post = await reject(id, status);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Determine the target users for notification (both up and down)
    let targetUsers = [];
    if (role === 'village_leader') {
      targetUsers = await Users.findAll({ where: { role: 'cell_leader', village_id } });
    } else if (role === 'cell_leader') {
      targetUsers = await Users.findAll({ where: { role: 'sector_leader', sector_id } });
    } else if (role === 'sector_leader') {
      targetUsers = await Users.findAll({ where: { role: 'district_leader', district_id } });
    } else if (role === 'district_leader') {
      targetUsers = await Users.findAll({ where: { role: 'province_leader', province_id } });
    }

    // Notify down (for leaders at the lower levels)
    let downUsers = [];
    if (role === 'province_leader') {
      downUsers = await Users.findAll({ where: { role: 'district_leader', province_id } });
    } else if (role === 'district_leader') {
      downUsers = await Users.findAll({ where: { role: 'sector_leader', district_id } });
    } else if (role === 'sector_leader') {
      downUsers = await Users.findAll({ where: { role: 'cell_leader', sector_id } });
    } else if (role === 'cell_leader') {
      downUsers = await Users.findAll({ where: { role: 'village_leader', cell_id } });
    }

    // Send notifications to the target users
    const claim = {
      message: "A post has been rejected. Check the system for more details.",
      posttitle: data.title,
    };

    const sendNotification = async (user) => {
      await createNotification({
        userID: user.id,
        title: "Post Rejection Alert",
        message: `A post has been rejected in your region. Check it out!`,
        type: 'Alert',
        isRead: false,
      });
    };

    // Notify target users (both up and down)
    const allUsers = [...targetUsers, ...downUsers];
    for (const user of allUsers) {
      await sendNotification(user,claim);
    }

    return res.status(200).json({
      success: true,
      message: "Post rejected successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const addCommentController = async (req, res) => {
  try {
    let userID=req.user.id;

    const { postID, comment } = req.body;

    if (!postID || !comment) {
      return res.status(400).json({
        success: false,
        message: "Post ID, name, and comment are required",
      });
    }

    const newComment = await createComment({ postID, userID, comment });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

