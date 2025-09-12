import express from "express";
import CompetitionRegistration from "../models/CompetitionRegistration.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadAadhar } from "../middleware/upload.js";
import Competition from "../models/Competition.js";

const router = express.Router();

/**
 * 📌 Register for Competition (User)
 * Fields: fullName, dateOfBirth, age, events[], aadharFile
 */
// routes/competitionRegister.js

router.post(
  "/register",
  uploadAadhar.single("aadharFile"),
  authMiddleware(["user", "admin"]),
  async (req, res) => {
    try {
      const { competitionId, fullName, dateOfBirth, age, events } = req.body;

      if (!competitionId || !fullName || !dateOfBirth || !age || !events) {
        return res.status(400).json({ msg: "All fields are required" });
      }

      // ✅ Check competition
      const competition = await Competition.findById(competitionId);
      if (!competition) {
        return res.status(404).json({ msg: "Competition not found" });
      }

      // ✅ Fix: Ensure `events` is an array of strings
      let parsedEvents = [];
      if (typeof events === "string") {
        try {
          parsedEvents = JSON.parse(events); // parse stringified array
        } catch {
          parsedEvents = [events]; // if it's a single string
        }
      } else if (Array.isArray(events)) {
        parsedEvents = events;
      }

      // ✅ Trim & validate each event
      parsedEvents = parsedEvents.map((e) => e.trim());

      const registration = new CompetitionRegistration({
        user: req.user.id,
        competition: competitionId,
        fullName,
        dateOfBirth,
        age,
        events: parsedEvents,
        aadharFile: req.file ? `/uploads/aadhar/${req.file.filename}` : null,
      });

      await registration.save();

      res.json({
        msg: `Registration submitted for competition "${competition.title}". Await admin approval.`,
        registration,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 📌 Get My Registrations (User)
 */
router.get(
  "/my-registrations",
  authMiddleware(["user", "admin"]),
  async (req, res) => {
    try {
      const registrations = await CompetitionRegistration.find({
        user: req.user.id,
      }).populate("competition", "title date status");

      res.json(registrations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 📌 Get Pending Registrations (Admin)
 */
router.get("/pending", authMiddleware(["admin"]), async (req, res) => {
  try {
    const registrations = await CompetitionRegistration.find({
      status: "pending",
    })
      .populate("user", "name email")
      .populate("competition", "title date status");

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Approve Registration (Admin)
 */
router.put("/approve/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const registration = await CompetitionRegistration.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    )
      .populate("user", "name email")
      .populate("competition", "title date status");

    if (!registration)
      return res.status(404).json({ msg: "Registration not found" });

    res.json({ msg: "Registration approved", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Reject Registration (Admin)
 */
router.put("/reject/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const registration = await CompetitionRegistration.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    )
      .populate("user", "name email")
      .populate("competition", "title date status");

    if (!registration)
      return res.status(404).json({ msg: "Registration not found" });

    res.json({ msg: "Registration rejected", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get All Registrations (Admin Only) — with only competition title
 */
router.get("/all", authMiddleware(["admin"]), async (req, res) => {
  try {
    const registrations = await CompetitionRegistration.find()
      .populate("user", "name email") // only name & email of user
      .populate("competition", "title"); // only title of competition

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
