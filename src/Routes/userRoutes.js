import express from 'express';
import { updateProfileData, updateProfilePic } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';

const route = express.Router();

route.patch("/update/profile-pic", authMiddleware, updateProfilePic)
route.put("/update/profile", authMiddleware, updateProfileData)

export default route;