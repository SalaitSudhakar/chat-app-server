import jwt from "jsonwebtoken";
import dotenv  from "dotenv";

dotenv.config();

export const generateToken = (id, res) => {
  const token = jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // send token through cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 24 * 60 * 60 * 1000, //24 hours in milliseconds
  });

  return token;
};
