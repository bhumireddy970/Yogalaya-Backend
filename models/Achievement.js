import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    photos: [String], // store image file paths
    videos: [String], // store video file paths
  },
  { timestamps: true }
);

export default mongoose.model("Achievement", achievementSchema);
