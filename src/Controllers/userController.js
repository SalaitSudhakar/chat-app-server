import { errorHandler } from "../Utils/errorHandler.js";

export const updateProfilePic = async (req, res, next) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if (!profilePic) return next(errorHandler(401, "Profile Pic is required"))
    } catch (error) {
        
    }
}

export const updateProfileData = async (req, res, next) => {
    res.send("update")
}