import mongoose from "mongoose";

const hourlyWorkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, enum: ["Planning", "Actual"], required: true },
    hour: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("HourlyWork", hourlyWorkSchema);
