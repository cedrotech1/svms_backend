import Email from "../utils/mailer.js";
import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  GetUserPassword,
  getallUsers,
  getUserByPhone,
  getUserByCode,
  updateUserCode,
  getMyUsers,
  getUserByNid,
  getalldocuments

} from "../services/userService.js";
import {
  createNotification,
} from "../services/NotificationService";
import db from "../database/models/index.js";
// const { Requests, Users,Documents } = db
const { Requests,Provinces, Districts, Sectors, Cells, Villages,Categories,Users,Posts,Notifications,Documents} = db;


import imageUploader from "../helpers/imageUplouder.js";



export const changePassword = async (req, res) => {
  console.log(req.user.id)
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if ( !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide userId, oldPassword, newPassword, and confirmPassword",
    });
  }

  try {
    const user = await GetUserPassword(req.user.id);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    console.log("Retrieved user from database:", user);

    const storedPassword = user || null;

    if (!storedPassword) {
      return res.status(500).json({
        success: false,
        message: "User password not found in the database",
      });
    }

    const validPassword = await bcrypt.compare(oldPassword, storedPassword);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUser(req.user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addUser = async (req, res) => {
  let role = req.user.role;

  if (!req.body.role || req.body.role === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide role",
    });
  }

  if (!req.body.firstname || req.body.firstname === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide firstname",
    });
  }
  if (!req.body.lastname || req.body.lastname === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide lastname",
    });
  }
  if (!req.body.email || req.body.email === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }
  if (!req.body.phone || req.body.phone === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide phone",
    });
  }
  console.log(req.body);
  
  let  province_id = req.user.province_id;
  let district_id = req.user.district_id;
  let sector_id = req.user.sector_id;
  let cell_id = req.user.cell_id;
  let village_id = req.user.village_id;

  if(req.body.role=='citizen')
  {
    req.body.province_id=province_id;
    req.body.district_id=district_id;
    req.body.sector_id=sector_id;
    req.body.cell_id=cell_id;
    req.body.village_id=village_id;
  }

  const NidExist = await getUserByNid(req.body.nid);
  if (NidExist) {
    return res.status(400).json({
      success: false,
      message: "National id  already exist",
    });
  }


  try {
    const userExist = await getUserByEmail(req.body.email);
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "email already exist",
      });
    }

    const phoneExist = await getUserByPhone(req.body.phone);
    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "phone number has been used",
      });
    }

    // generate password
    const password = `D${Math.random().toString(36).slice(-8)}`;
    // const password = `1234`;

    // create user with generated password and set status to active
    req.body.password = password;
    req.body.status = "active";
    // req.body.role = "citizen";
    let nid=req.body.nid;
   


console.log(req.body)
    const newUser = await createUser(req.body);
    newUser.password = password;
    // console.log(req.user.province_id)
    // send email
    // await new Email(newUser).sendAccountAdded();

    const notification = await createNotification({ userID:newUser.id,title:"Account created for you", message:"your account has been created successfull", type:'account', isRead: false });
    

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role, 
        province_id:newUser.province_id,
        district_id:newUser.district_id,
        sector_id:newUser.sector_id,
        cell_id:newUser.cell_id,
        village_id:newUser.village_id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const SignUp = async (req, res) => {
 
  if (!req.body.role || req.body.role === "" || !req.body.firstname || req.body.firstname === "" || !req.body.lastname || req.body.lastname === "" ||  !req.body.email || req.body.email === "" || !req.body.phone || req.body.phone === ""
     || !req.body.gender || req.body.gender === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide all information",
      });
    }
  console.log(req.body);
  const { password, confirmPassword } = req.body;

  // Check if password is provided
  if (!password || password === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide a password",
    });
  }

  // Check if confirmPassword is provided
  if (!confirmPassword || confirmPassword === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide a confirmation password",
    });
  }

  // Compare password and confirmPassword
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }



  try {
    const userExist = await getUserByEmail(req.body.email);
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "email already exist",
      });
    }

    const NidExist = await getUserByNid(req.body.nid);
    if (NidExist) {
      return res.status(400).json({
        success: false,
        message: "National id  already exist",
      });
    }

    const phoneExist = await getUserByPhone(req.body.phone);
    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "phone number has been used",
      });
    }

    // generate password
    // const password = `D${Math.random().toString(36).slice(-8)}`;
    const password = req.body.password;

    // create user with generated password and set status to active
    req.body.password = password;
    req.body.status = "active";
    req.body.role = "citizen";



    const newUser = await createUser(req.body);
    newUser.password = password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role, 
        province_id:newUser.province_id,
        district_id:newUser.district_id,
        sector_id:newUser.sector_id,
        cell_id:newUser.cell_id,
        village_id:newUser.village_id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try { 
    let filteredusers=[];
    let users = await getUsers();

    if(req.user.role=='village_leader'){
      let myusers = await getMyUsers(req.user.village_id);
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        users:myusers,
      });

    }
    if(req.user.role=='admin'){

      let citizens = users.filter(user => user.role !== "citizen" && user.id !== req.user.id );
      
      // filter users ruturn users not have role of citizen
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        users:citizens,
      });

    }

   

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users:users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const getCitizen = async (req, res) => {
  try { 
    let filteredusers=[];
    let users = await getUsers();


      let citizens = users.filter(user => user.role === "citizen");
      

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users:citizens,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};





export const getOneUser = async (req, res) => {

  try {
    const user = await getUser(req.params.id);

       if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const updateOneUser = async (req, res) => {
  try {
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
    let nid=req.body.nid;
    console.log(req.body.image)
    const user = await updateUser(req.params.id, req.body);
    if(req.params.id!=req.user.id){
      const notification = await createNotification({ userID:req.params.id,title:"your  account has been updated", message:"your account has been edited by admin", type:'account', isRead: false });
    
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};




export const deleteOneUser = async (req, res) => {
  try {
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (req.user.role === "customer" && req.user.role !== "restaurentadmin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
  
    const user = await deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const activateOneUser = async (req, res) => {
  
  try {

    // let role = req.user.role;
    // if (role === "restaurentadmin") {
    //   if (req.body.role === "superadmin" || req.body.role === "restaurentadmin") {
    //     return res.status(400).json({
    //       success: false,
    //       message: "you are not allowed to add superadmin or restaurentadmin ",
    //     });
    //   }}


    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
 


    const user = await activateUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const deactivateOneUser = async (req, res) => {
  try {
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
 
    const user = await deactivateUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};


export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your Email",
    });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "There is no account associated with that email",
      });
    }

    // Generate a random 6-digit code including time string
    const timestamp = Date.now().toString().slice(-3); // Get the last 3 digits of the timestamp
    const randomPart = Math.floor(100 + Math.random() * 900).toString(); // Get a 3-digit random number
    const code = timestamp + randomPart; // Combine both parts to form a 6-digit code


    await new Email(user, null, code).sendResetPasswordCode();
    const user1 = await updateUserCode(email, {code:code});

    return res.status(200).json({
      success: true,
      message: "Code sent to your email successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkCode = async (req, res) => {
  const { code } = req.body;
  if (!req.params.email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your Email",
    });
  }

  try {
    const user = await getUserByCode(req.params.email,code);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "invalid code",
      });
    }

    return res.status(200).json({
      success: true,
      message: "now you can reset your password",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const ResetPassword = async (req, res) => {

  const user = await getUserByEmail(req.params.email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "There is no account associated with that email",
    });
  }
  if (!user.code) {
    return res.status(400).json({
      success: false,
      message: "No Reset Code",
    });
  }
  const { newPassword, confirmPassword } = req.body;
  if ( !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide newPassword, and confirmPassword",
    });
  }

  try {

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUser(user.id, { password: hashedPassword,code:'' });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully, Login",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addRequest = async (req, res) => {
  try {
    let userID = req.user.id; // Get logged-in user ID
    const { reson, province_id, district_id, sector_id, cell_id, village_id } = req.body;
    
    const request = await Requests.create({
      userID,
      reson,
      status: "pending",
      province_id,
      district_id,
      sector_id,
      cell_id,
      village_id,
    });

    const notification = await createNotification({ userID:1,title:"New request", message:"your new request in system !", type:'request', isRead: false });
    
    
    res.status(201).json({ message: "Request submitted successfully", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a request
export const approveRequest = async (req, res) => {
  try {
    const { requestID } = req.params;
    const request = await Requests.findByPk(requestID);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await Users.update(
      {
        province_id: request.province_id,
        district_id: request.district_id,
        sector_id: request.sector_id,
        cell_id: request.cell_id,
        village_id: request.village_id,
      },
      { where: { id: request.userID } }
    );
    
    await request.update({ status: "approved" });
    const notification = await createNotification({ userID:request.userID,title:"Request Approved", message:"your request has been approved !", type:'request', isRead: false });
    

    res.status(200).json({ message: "Request approved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject a request
export const rejectRequest = async (req, res) => {
  try {
    const { requestID } = req.params;
    const request = await Requests.findByPk(requestID);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await request.update({ status: "rejected" });
    const notification = await createNotification({ userID:request.userID,title:"Request Rejected", message:"your request has been rejected !", type:'request', isRead: false });
    
    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get requests based on user role
export const getRequests = async (req, res) => {
  try {
    let requests;

    if (req.user.role === "admin") {
      // Admin can see all requests
      requests = await Requests.findAll(
        {
          include: [
         
           
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
              include: [
           
                
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
                }
                
              ],
            },
           
            
            
          ],
        }
      );
    } else {
      // Citizens can only see their own requests
      requests = await Requests.findAll({ where: { userID: req.user.id },
        include: [
         
           
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
            include: [
         
              
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
              }
              
            ],
          },
         
          
          
        ],
       });
    }

    if (requests.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const  addDocument = async (req, res) => {
  try {
    let image = null;
    
    // Handle image upload
    if (req.files && req.files.image) {
      try {
        const uploadedImage = await imageUploader(req);
        if (!uploadedImage || !uploadedImage.url) {
          throw new Error("Upload failed or image URL missing");
        }
        image = uploadedImage.url;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const { userID, category, title, description } = req.body;

    if (!userID || !category || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let RecordedBy=req.user.id;

    const newDocument = await Documents.create({
      userID,
      category,
      title,
      description,
      image, // Store the uploaded image URL
      RecordedBy
    });
    const notification = await createNotification({ userID:userID,title:"Document added", message:"your account has beed added new document", type:'request', isRead: false });
    
    res.status(201).json({ message: "Document added successfully", data: newDocument });
  } catch (error) {
    res.status(500).json({ message: "Error adding document", error: error.message });
  }
};

// View all documents
export const  viewMyDocuments = async (req, res) => {
  try {
    let all = await getalldocuments(req.user.id);
    // const documents = await Documents.findAll();
    res.status(200).json({ message: "Documents retrieved successfully", data: all });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
};

// Delete a document by ID
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Documents.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.destroy();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};




