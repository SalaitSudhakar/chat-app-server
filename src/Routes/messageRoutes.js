import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { addReaction, clearChat, deleteMessageForMe, deleteReaction, getMessages, sendMessage } from '../Controllers/messageController.js';
import upload from './../Config/multer.js';

const route = express.Router();

route.get("/:id", authMiddleware, getMessages);
route.post("/send/:id", authMiddleware, upload('messageImages').single('image'), sendMessage);
route.patch("/clear-chat/:id", authMiddleware, clearChat);
route.patch("/delete-for-me/:id", authMiddleware, deleteMessageForMe);
route.patch("/add-reaction/:id", authMiddleware, addReaction);
route.delete("/delete-reaction/:id", authMiddleware, deleteReaction);

export default route;
