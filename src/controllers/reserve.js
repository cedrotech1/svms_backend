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
    getAllPostes_forlocation
    
  
  } from "../services/PostsService.js";
  import imageUploader from "../helpers/imageUplouder.js";
  
  
  import {
    getOneCategoryWithDetails
  } from "../services/categoriesService.js";
  
  export const addPostController = async (req, res) => {
    try {
     req.body.userID=req.user.id;
     let role=req.user.role;
  
     const { province_id, district_id, sector_id, cell_id, village_id } = req.user;
      req.body.province_id=province_id;
      req.body.district_id=district_id;
      req.body.sector_id=sector_id;
      req.body.cell_id=cell_id;
      req.body.village_id=village_id;
  
    //  if (role=="admin"){
    //   return res.status(400).json({
    //     success: false,
    //     message: "admin can not post !",
    //   });
    //  }
  
    // if (!req.body.province_id || req.body.district_id === "" || req.body.sector_id === "" || req.body.cell_id === "" || req.body.village_id === "") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please provide full location",
    //   });
    // }
  
    
  
      if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
        req.body.status='approved'
      }
  
      if (role=="cell_leader") {
        req.body.status='approvedbycell'
      }
      if (role=="village_leader") {
        req.body.status='approvedbyvillage'
      }
  
      if (!req.body.title) {
        return res.status(400).json({
          success: false,
          message: "title is required",
        });
      }
  
      const data = await getOneCategoryWithDetails(req.body.categoryID);
      if (!data) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
      let image; 
      if (req.files && req.files.image) {
        try {
          image = await imageUploader(req);
          if (!image || !image.url) {
            throw new Error('Upload failed or image URL missing');
          }
          req.body.image = image.url;
          console.log(req.body.image)
        } catch (error) {
          console.error('Error uploading image:', error);
          // Handle error appropriately
        }
      }else{
        req.body.image = null;
      }
  
      const existingpost = await checkExistingPost(req.body.title);
      if (existingpost) {
        return res.status(400).json({
          success: false,
          message: "post detail exists",
        });
      }
      const newpost = await createPost(req.body);
  
      return res.status(201).json({
        success: true,
        message: "post created successfully",
        post: newpost,
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
        statusArray = ["approvedbycell","rejectedbysector","approved"];
        data = await getAllPostes_forlocation("sector_id", sector_id, statusArray);
      } else if (role === "cell_leader") {
        statusArray = ["approvedbyvillage","approvedbycell","rejectedbycell","approvedbysector","rejectedbysector","approved"];
        data = await getAllPostes_forlocation("cell_id", cell_id, statusArray);
      } else if (role === "village_leader") {
        statusArray = ["approved","pending","approvedbycell","rejectedbycell","approvedbyvillage","rejectedbyvillage","rejectedbysector","approvedbysector"];
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
  
  export const deleteOnePostController = async (req, res) => {
    try {
      const { id } = req.params;
      const userID = req.user.id; 
      const data = await getOnePostWithDetails(id);
      if (!data) {
        return res.status(404).json({
          message: "post detail not found",
          data:[],
        });
      }
    
  
      const Post = await deleteOnePost(req.params.id);
      if (!Post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Post deleted successfully",
        Post,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong",
        error,
      });
    }
  };
  
  
  
  export const updatepost = async (req, res) => {
   
    try {
      const { id } = req.params;
      req.body.userID=req.user.id;
  
      const post = await getOnePostWithDetails(id,req.user.id);
      if (!post) {
        return res.status(404).json({
          message: "post detail not found",
          data:[],
        });
      }
       req.body.name = req.body.name.toUpperCase();
       if (!req.body.name) {
         return res.status(400).json({
           success: false,
           message: "Name is required",
         });
       }
   
       const data = await getOneCategoryWithDetails(req.body.categoryID);
       if (!data) {
         return res.status(404).json({
           message: "Category not found",
         });
       }
       let image; 
       if (req.files && req.files.image) {
         try {
           image = await imageUploader(req);
           if (!image || !image.url) {
             throw new Error('Upload failed or image URL missing');
           }
           req.body.image = image.url;
           console.log(req.body.image)
         } catch (error) {
           console.error('Error uploading image:', error);
           // Handle error appropriately
         }
       }
   
       const updated = await updateOne(id, req.body);
  
       return res.status(201).json({
         success: true,
         message: "post created successfully",
         updated: updated,
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
  
  export const approvePostController = async (req, res) => {
    try {
  
      const { id } = req.params;
      const userID = req.user.id; // Get logged-in user's ID
  
      const data = await getOnePostWithDetails(id);
      if (!data) {
        return res.status(404).json({
          message: "post detail not found",
          data:[],
        });
      }
  
      if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
        req.body.status='approved'
      }
  
      if (role=="cell_leader") {
        req.body.status='approvedbycell'
      }
      if (role=="village_leader") {
        req.body.status='approvedbyvillage'
      }
     
  
      const post = await approve(req.params.id,req.body.status);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "post not found",
          
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "post activated successfully",
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
      const userID = req.user.id; // Get logged-in user's ID
  
      const data = await getOnePostWithDetails(id,userID);
      if (!data) {
        return res.status(404).json({
          message: "post detail not found",
          data:[],
        });
      }
  
      if (role=="admin" || role=="province_leader"  || role=="district_leader" || role=="sector_leader") {
        req.body.status='rejected'
      }
  
      if (role=="cell_leader") {
        req.body.status='rejectedbycell'
      }
      if (role=="village_leader") {
        req.body.status='rejectedbyvillage'
      }
     
  
      const post = await reject(req.params.id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "post not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "post rejected successfully",
        post
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong",
        error,
      });
    }
  };