const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Add new student
router.post("/add-student", attendanceController.addStudent);

// Get all students
router.get("/students", attendanceController.getStudents);

// Mark attendance
router.post("/mark-attendance", attendanceController.markAttendance);

// Get attendance by date
router.get("/:date", attendanceController.getAttendanceByDate);

module.exports = router;
