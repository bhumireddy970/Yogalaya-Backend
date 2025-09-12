const Attendance = require("../models/Attendance");
const FaceUser = require("../models/FaceUser");

/**
 * Helper function to normalize date to IST midnight
 */
function getLocalMidnight(date = new Date()) {
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

// 📌 Add or update a student
exports.addStudent = async (req, res) => {
  try {
    const { name, gender, idNumber, faceDescriptor } = req.body;

    if (!name || !gender || !idNumber || !faceDescriptor) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const descriptorArray = Array.isArray(faceDescriptor)
      ? faceDescriptor.map(Number)
      : Array.from(faceDescriptor);

    let user = await FaceUser.findOne({ idNumber });

    if (user) {
      user.faceDescriptors.push(descriptorArray);
    } else {
      user = new FaceUser({
        name,
        gender,
        idNumber,
        faceDescriptors: [descriptorArray],
      });
    }

    await user.save();
    return res.json({ message: "Student added/updated successfully", user });
  } catch (err) {
    console.error("❌ Error saving student:", err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "ID Number already exists" });
    }

    return res.status(500).json({ error: err.message });
  }
};

// 📌 Get all students
exports.getStudents = async (req, res) => {
  try {
    const users = await FaceUser.find(
      {},
      "name idNumber gender faceDescriptors"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Mark attendance (IST timezone fixed)
exports.markAttendance = async (req, res) => {
  try {
    const { idNumber } = req.body;
    const user = await FaceUser.findOne({ idNumber });
    if (!user) return res.status(404).json({ error: "Student not found" });

    const todayLocal = getLocalMidnight();

    const attendance = await Attendance.findOneAndUpdate(
      { student: user._id, date: todayLocal },
      { status: "Present" },
      { upsert: true, new: true }
    );

    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get attendance by date (IST timezone fixed)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    const startLocal = new Date(
      start.getTime() - start.getTimezoneOffset() * 60000
    );
    const endLocal = new Date(end.getTime() - end.getTimezoneOffset() * 60000);

    const records = await Attendance.find({
      date: { $gte: startLocal, $lte: endLocal },
    })
      .populate("student")
      .lean();

    res.json(records.filter((r) => r.student !== null));
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ error: "Server error" });
  }
};
