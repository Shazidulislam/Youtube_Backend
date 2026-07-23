import mongoose, { Schema } from "mongoose";

const tweetsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Tweets = mongoose.model("Tweets", tweetsSchema);
