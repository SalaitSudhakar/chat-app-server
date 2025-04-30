import express from 'express';
import { updateProfileData, updateProfilePic } from '../Controllers/userController.js';

const route = express.Router();

route.patch("/update/profile-pic", updateProfilePic)
route.put("/update/profile", updateProfileData)

export default route;