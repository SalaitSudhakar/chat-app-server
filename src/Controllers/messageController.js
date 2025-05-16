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
  const messageId = req.params.id;
  const { emoji } = req.body;
  const { _id: userId, fullname } = req.user;

  // Validate emoji
  if (!emoji) return next(errorHandler(400, "Emoji is required"));

  const isEmojiValid = /^\p{Extended_Pictographic}$/u.test(emoji);

  if (!isEmojiValid) {
    return next(
      errorHandler(400, "Invalid emoji. Only one valid emoji is allowed")
    );
  }

  // Validate messageId
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Invalid Message ID"));
  }

  try {
    const message = await Message.findById(messageId).select("-deletedFor");

    if (!message) {
      return next(errorHandler(404, "Message not found"));
    }

    // Check authorization
    if (
      !message.senderId.equals(userId) &&
      !message.receiverId.equals(userId)
    ) {
      return next(
        errorHandler(403, "You are not authorized to react to this message")
      );
    }

    // Check if user already reacted
    const existingReactionIndex = message.emojiReactions.findIndex((reaction) =>
      reaction.userId.equals(userId)
    );

    if (existingReactionIndex !== -1) {
      // Update existing emoji
      message.emojiReactions[existingReactionIndex].emoji = emoji;
    } else {
      // Add new reaction
      message.emojiReactions.push({ userId, emoji, fullname });
    }

    await message.save();

    // Notify both users (sender and receiver)
    const receiverId = message.senderId.equals(userId)
      ? message.receiverId
      : message.senderId;

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(userId);

    // Emit to both sender and receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionUpdated", {
        messageId,
        emojiReactions: message.emojiReactions,
      });
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("reactionUpdated", {
        messageId,
        emojiReactions: message.emojiReactions,
      });
    }

    res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      messageData: message,
    });
  } catch (error) {
    next(error);
  }
};

/* Delete Emoji Reaction */
export const deleteReaction = async (req, res, next) => {
  const messageId = req.params.id;
  const { _id: userId } = req.user;

  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return next(errorHandler(400, "Invalid Message ID"));
  }

  try {
    const message = await Message.findById(messageId).select("-deletedFor");

    if (!message) {
      return next(errorHandler(404, "Message not found"));
    }

    const reactionExists = message.emojiReactions.some(
      (reaction) => reaction.userId.toString() === userId.toString()
    );

    if (!reactionExists) {
      return next(
        errorHandler(
          400,
          "You haven't reacted to this message. or you are not authorized to delete it"
        )
      );
    }

    // This will remove the emojiReaction for that userId
    message.emojiReactions = message.emojiReactions.filter(
      (reaction) => reaction.userId.toString() !== userId.toString()
    );

    await message.save();

    // Notify both users (sender and receiver)
    const receiverId = message.senderId.equals(userId)
      ? message.receiverId
      : message.senderId;

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionRemoved", {
        messageId,
        emojiReactions: message.emojiReactions,
      });
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("reactionRemoved", {
        messageId,
        emojiReactions: message.emojiReactions,
      });
    }

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
      messageData: message,
    });
  } catch (error) {
    next(error);
  }
};
