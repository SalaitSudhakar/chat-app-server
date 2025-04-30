import cloudinary from "../Config/cloudinary.js";
import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";

export const updateProfilePic = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) return next(errorHandler(401, "Profile Pic is required"));

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updateUser = await User.findByIdAndUpate(userId, { profilePic: uploadResponse.secure_url}, {new: true});

    res.status(200).json({success: true, message: "Profile Pic updated successfully", userData: updateUser})

  } catch (error) {
    next(error)
  }
};

export const updateProfileData = async (req, res, next) => {
  res.send("update");
};
