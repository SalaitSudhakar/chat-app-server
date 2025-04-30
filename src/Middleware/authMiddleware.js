import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { errorHandler } from "../Utils/errorHandler.js";
import User from "./../Models/userModel.js";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    // Handle token missing
    if (!req.cookies?.token) {
      return next(errorHandler(401, "Token is missing"));
    }

    if (!process.env.JWT_SECRET) {
      return next(
        errorHandler(500, "JWT_SECRET is missing in environment variables")
      );
    }

    // Decode Token
    const decodedToken = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

    // If id is missing in decoded token
    if (!decodedToken?.id) {
      return next(errorHandler(401, "Invalid Token"));
    }

    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return next(errorHandler(404, "user not found"));
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Token Expired"));
    }

    return next(errorHandler(401, "Invalid Token"));
  }
};
