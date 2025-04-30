import express from 'express';
import { getUsers, updateProfilePic } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';

const route = express.Router();

route.put("/update/profile-pic", authMiddleware, updateProfilePic)
route.get("/users", authMiddleware, getUsers)

export default route;