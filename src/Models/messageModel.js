import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    emojiReactions: [
      {
        _id: false,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        emoji: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
