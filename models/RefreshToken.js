import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new mongoose.Schema(
  {
    token: { type: String },
    user_id: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default model("RefreshToken", userSchema);
