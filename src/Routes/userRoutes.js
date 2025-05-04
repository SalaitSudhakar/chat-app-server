import express from 'express';
import { getUsers, updateProfile, updateProfilePic } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import upload from '../Config/multer.js';

const route = express.Router();

route.patch("/update/profile-pic", authMiddleware, upload('profiles').single("profilePic"), updateProfilePic)
route.put("/update/profile", authMiddleware, updateProfile)
route.get("/users", authMiddleware, getUsers)

export default route;