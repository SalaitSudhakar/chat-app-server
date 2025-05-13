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
    }).select("-deletedFor");

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

/* clear chat */
export const clearChat = async (req, res, next) => {
  const secondPersonId = req.params.id;
  const { _id: myId } = req.user;

  if (!secondPersonId || !mongoose.Types.ObjectId.isValid(secondPersonId)) {
    return next(errorHandler(400, "Invalid user ID in params"));
  }

  if (!secondPersonId)
    return next(errorHandler(400, " User Id required from params "));

  try {
    // Step 1: Mark messages as deleted for current user
    await Message.updateMany(
      {
        $or: [
          { senderId: secondPersonId, receiverId: myId },
          { senderId: myId, receiverId: secondPersonId },
        ],
      },
      { $addToSet: { deletedFor: myId } } //Prevents duplicate
    );

    // Step 2: Delete messages where both users have deleted
    await Message.deleteMany({
      $or: [
        { senderId: secondPersonId, receiverId: myId },
        { senderId: myId, receiverId: secondPersonId },
      ],
      deletedFor: { $all: [myId, secondPersonId] },
    });

    res.status(200).json({ message: "Chat Cleared" });
  } catch (error) {
    next(error);
  }
};

/* Delete for me */
export const deleteMessageForMe = async (req, res, next) => {
  const messageId = req.params.id;
  const { _id: myId } = req.user;

  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Invalid Message ID from params"));
  }

  try {
    // Proper filtering: Find the message only if not already deleted for this user
    const message = await Message.findOne({
      _id: messageId,
      deletedFor: { $ne: myId },
    });

    if (!message) {
      return next(errorHandler(404, "Message not found"));
    }

    const otherPersonId = message.senderId.equals(myId)
      ? message.receiverId
      : message.senderId;

    // Mark message as deleted for current user
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: myId },
    });

    // Delete message if both users have deleted
    if (
      message.deletedFor?.includes(otherPersonId.toString()) ||
      message.deletedFor?.includes(otherPersonId) // extra safety
    ) {
      await Message.findByIdAndDelete(messageId);
    }

    res.status(200).json({ message: "Message Deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* Add Emoji Reaction */
export const addReaction = async (req, res, next) => {
  const messageId = req.params.id; // get message id from params
  const { emoji } = req.body; // Get emoji from req.body
  const { _id: userId } = req.user; // Get user id from authmiddleware

  /* Validate emoji */
  if (!emoji) return next(errorHandler(400, "Emoji required"));

  const isEmoji = /^\p{Emoji}$/u.test(emoji);

  if (!isEmoji) return next(errorHandler(400, "Invalid Emoji or not an emoji and only one emoji allowed"));

  /* Validate MessageId */
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Invalid Message ID from params"));
  }

  try {
    /* Fetch message using id */
    const message = await Message.findById(messageId).select("-deletedFor");

    /* check there is no message with this id */
    if (!message) return next(errorHandler(404, "Message is not found"));

    /* Check if the user is authorized to react (either sender or receiver of the message) */
    if (
      message.senderId.toString() !== userId.toString() &&
      message.receiverId.toString() !== userId.toString()
    )
      return next(
        errorHandler(400, "You are not authorized to react to this message")
      );

    /* Find the index of the reaction of current user, if they already exists */
    const existingReactionIndex = message.emojiReactions.findIndex(
      (reaction) => reaction.userId.toString() === userId.toString()
    );

    /* Update reaction (emoji), if user already reacted or push new emoji */
    if (existingReactionIndex !== -1) {
      message.emojiReactions[existingReactionIndex].emoji = emoji;
    } else {
      message.emojiReactions.push({ userId, emoji });
    }

    await message.save(); //save the changes

    res.status(200).json({
      success: true,
      message: "Reaction Updated successfully",
      messageData: message,
    });
  } catch (error) {
    next(error);
  }
};
