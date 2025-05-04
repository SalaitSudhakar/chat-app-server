import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";
import validator from "validator";

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

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const updateData = {};

    /* Fullname */
    if (req.body?.fullname) {
      const fullname = req.body.fullname;

      // Validate fullname
      if (!validator.isAlphanumeric(fullname.replace(/\s/g, ""))) {
        return next(
          errorHandler(400, "Name can only contain strings, number and space")
        );
      }

      // Add fullname to updateData object
      updateData.fullname = fullname;
    }

    /* Email */
    if (req.body.email) {
      const email = req.body.email;

      //  Validate email
      if (!validator.isEmail(email)) {
        return next(errorHandler(400, "Invalid email format"));
      }

      /* Add to update data object */
      updateData.email = email;
    }

    /* Password */
    if (req.body.password) {
      const password = req.body.password;

      // validate password
      if (
        !validator.isStrongPassword(password, {
          minLength: 6,
          minSymbols: 1,
          minNumbers: 1,
          minLowercase: 1,
        })
      ) {
        return next(
          errorHandler(
            400,
            "Password must be at least 6 character length and it must contain at least 1 lowercase,1 uppercase, 1 number and 1 symbol."
          )
        );
      }
      /* Add to update data object */
      updateData.password = password;
    } 

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile Data updated successfully",
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
