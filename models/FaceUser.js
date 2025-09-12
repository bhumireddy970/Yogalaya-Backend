const mongoose = require("mongoose");

const faceUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  idNumber: { type: String, unique: true, required: true }, // ✅ unique student ID
  faceDescriptors: {
    type: [[Number]], // array of face encodings
    default: [],
  },
});

module.exports = mongoose.model("FaceUser", faceUserSchema);
