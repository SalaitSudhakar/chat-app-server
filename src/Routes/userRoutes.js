import express from 'express';
import { getUsers, updateProfilePic } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import upload from '../Config/multer.js';

const route = express.Router();

route.put("/update/profile-pic", authMiddleware, upload('profiles').single("profilePic"), updateProfilePic)
route.get("/users", authMiddleware, getUsers)

export default route;