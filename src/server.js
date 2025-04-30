import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./Database/databaseConfig.js";
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from './Routes/userRoutes.js';
import messageRoutes from './Routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// only allow these origins
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

// To convert the json payload from requrest body to type object
app.use(express.json());

// To allow api request from another domain, cors should be enabled
app.use(cors({ origin: allowedOrigins, credentials: true })); // To handle cookie, credentials must be true
app.use(cookieParser()); // To handle cookie

/* Default Route */
app.get("/", (req, res) => {
  res.send("Welcome to my Chat App API");
});

// App routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/message', messageRoutes)

// Error Middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  return res
    .status(statusCode)
    .json({
      success: false,
      message: message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
});

// Connect the database
connectDb();

// Start the server
app.listen(PORT, (req, res) => {
  console.log("Server is started and running on the port.");
});
