import { getReceiverSocketId, io } from "../Config/socket.js";
import { errorHandler } from "../Utils/errorHandler.js";
import Message from "./../Models/messageModel.js";
import mongoose from "mongoose";

export const getMessages = async (req, res, next) => {
  try {
    // Receivers Id
    const { id: userToChatId } = req.params;

    if (!userToChatId)
      return next(errorHandler(400, "Id in params is missing"));

    /* Sender Id */
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],

      deletedFor: { $ne: myId },
    });

    res
      .status(200)
      .json({ success: true, message: "Messages Retrieved", messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (!receiverId) return next(errorHandler(400, "Receiver Id required"));
    const { text } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Message text or image is required.",
      });
    }

    const messageData = {
      senderId,
      receiverId,
    };

    if (req.file) {
      messageData.image = req.file.path;
    }

    if (text) {
      messageData.text = text;
    }

    const newMessage = new Message(messageData);
    await newMessage.save();

    /* Socket */
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const clearChat = async (req, res, next) => {
  const secondPersonId = req.params.id;
  const { _id: myId } = req.user;

  if (!secondPersonId || !mongoose.Types.ObjectId.isValid(secondPersonId)) {
    return next(errorHandler(400, "Invalid user ID in params"));
  }

  if (!secondPersonId)
    return next(errorHandler(400, " User Id required from params "));

  try {
    const messages = await Message.updateMany(
      {
        $or: [
          { senderId: secondPersonId, receiverId: myId },
          { senderId: myId, receiverId: secondPersonId },
        ],
      },
      { $addToSet: { deletedFor: myId } } //Prevents duplicate
    );

    if (!messages) return next(errorHandler(404, "No messages Found"));

    res.status(200).json({ message: "Chat Cleared" });
  } catch (error) {
    next(error);
  }
};
