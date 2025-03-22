import express from "express";
import {
  addPostController,
  PostWithAllController,
  deleteOnePostController,
  getOnePostController,
  approvePostController,
  rejectPostController,
  addCommentController,
} from "../controllers/PostController.js";

import { protect, optionalProtect } from "../middlewares/protect.js";

const router = express.Router();
// 0783043021

router.delete("/delete/:id", protect, deleteOnePostController);
router.post("/add/", protect, addPostController);
router.get("/", optionalProtect, PostWithAllController);
router.get("/all", protect, PostWithAllController);
router.get("/one/:id", optionalProtect, getOnePostController);
router.put("/approve/:id", protect, approvePostController);
router.put("/reject/:id", protect, rejectPostController);
router.post("/comment",protect, addCommentController);

export default router;
