import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

// Create the express app (don't create this again in server.js)
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  },
});

// Used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    socket.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.broadcast.emit("userJoined", userId);
  } else {
    console.warn("[Server] No userId provided in handshake query");
  }

  socket.on("error", (error) => {
    console.error(`[Server] Socket error:`, error);
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];

      socket.broadcast.emit("userLeft", userId);

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
