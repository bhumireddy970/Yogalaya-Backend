import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who registers
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    aadharFile: { type: String }, // path to uploaded PDF
    events: [
      {
        type: String,
        enum: [
          "Traditional",
          "Forward Bend",
          "Back Bend",
          "Twisting Body",
          "Leg Balance",
          "Hand Balance",
          "Supine",
          "Artistic Solo",
          "Artistic Pair",
          "Rhythemic Pair",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("CompetitionRegistration", registrationSchema);
