const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FaceUser",
    required: true,
  },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent"], default: "Present" },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
