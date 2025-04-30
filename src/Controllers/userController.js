import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";

export const updateProfilePic = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.file || !req.file.path)
      return next(errorHandler(400, "Profile Picture file is missing"));

    const profilePic = req.file.path;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic } },
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

    // Get all the users other than current logged in user
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
