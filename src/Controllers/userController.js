import cloudinary from "../Config/cloudinary.js";
import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";

export const updateProfilePic = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) return next(errorHandler(401, "Profile Pic is required"));

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chat-app/profiles",  // Optional: specify folder for Cloudinary storage
      resource_type: "auto"    // Automatically detects file type (image/video/etc.)
    });

    const updateUser = await User.findByIdAndUpate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile Pic updated successfully",
      userData: updateUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } });

    res.status(200).json({
      success: true,
      message: "User fetched Successfully",
      users: filteredUsers,
    });
  } catch (error) {
    next(error);
  }
};
