import { errorHandler } from "../Utils/errorHandler.js";
import Message from "./../Models/messageModel.js";

export const getMessages = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;

    if (!userToChatId)
      return next(errorHandler(400, "Id in params is missing"));
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
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
    const { text } = req.body;

    if (!text && !req.file) {
      return res
        .status(400)
        .json({
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

    res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
