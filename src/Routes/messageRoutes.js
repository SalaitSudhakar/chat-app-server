import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { getMessages, sendMessage } from '../Controllers/messageController.js';
import upload from './../Config/multer.js';

const route = express.Router();

route.get("/:id", authMiddleware, getMessages);
route.post("/send/:id", authMiddleware, upload('messageImages').single('image'), sendMessage);

export default route;