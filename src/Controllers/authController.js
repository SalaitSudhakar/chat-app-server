import validator from "validator";
import { errorHandler } from "./../Utils/errorHandler.js";
import User from "./../Models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../Utils/generateToken.js";

export const signup = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  // validate the datas
  if (!fullname || !email || !password) {
    return next(
      errorHandler(400, "Fullname, email, password all are required")
    );
  }

  // Validate fullname
  if (!validator.isAlphanumeric(fullname.replace(/\s/g, ""))) {
    return next(errorHandler(400, "Name can only contain strings, number and space"));
  }

  //  Validate email
  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format"));
  }

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
  try {
    // Check if user already exist
    const user = await User.findOne({ email });

    if (user) {
      next(errorHandler(400, "Email already Exists"));
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create New User
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    // Save newUser in the db
    await newUser.save();

    // Generate token
    generateToken(newUser._id, res);

    /* Separate user details without password */
    const { password: _, ...userData} = newUser._doc; 
    
    // Send response with userDetails
    res.status(201).json({
      success: true,
      message: "User Registered successfully",
      userData
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(errorHandler(400, "Email and Password both are required"));
  }

  if (!validator.isEmail(email)) {
    next(errorHandler(404, "Invalid Email"));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return next(errorHandler(404, "User Not Found"));

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) return next(errorHandler(400, "Invalid Credentials"));

    generateToken(user._id, res);

    /* Separate user details without password */
    const { password:_, ...userData } = user._doc;

    // Send response with userDetails
    res.status(200).json({
      success: true,
      message: "User Loggedin successfully",
      userData
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      })
      .status(200)
      .json({ success: false, message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const checkAuth = (req, res, next) => {
  try {
    res
      .status(200)
      .json({
        success: true,
        message: "User authenticated",
        userData: req.user,
      });
  } catch (error) {
    next(error);
  }
};
