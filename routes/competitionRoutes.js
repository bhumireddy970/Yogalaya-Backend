import express from "express";
import Competition from "../models/Competition.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadCircular } from "../middleware/upload.js";

const router = express.Router();

// 📌 Create
router.post(
  "/",
  authMiddleware(["admin"]),
  uploadCircular.single("circular"),
  async (req, res) => {
    try {
      const { title, description, date, status } = req.body;

      const competition = new Competition({
        title,
        description,
        date,
        status,
        circular: req.file ? `/uploads/circulars/${req.file.filename}` : null,
        createdBy: req.user.id,
      });

      await competition.save();
      res.json({ msg: "Competition created successfully", competition });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 📌 Get All
router.get("/", async (req, res) => {
  try {
    const competitions = await Competition.find().sort({ date: 1 });
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get Single
router.get("/:id", async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition)
      return res.status(404).json({ msg: "Competition not found" });
    res.json(competition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Update
router.put(
  "/:id",
  authMiddleware(["admin"]),
  uploadCircular.single("circular"),
  async (req, res) => {
    try {
      const { title, description, date, status } = req.body;

      const updatedData = { title, description, date, status };

      if (req.file) {
        updatedData.circular = `/uploads/circulars/${req.file.filename}`;
      }

      const competition = await Competition.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );

      if (!competition)
        return res.status(404).json({ msg: "Competition not found" });

      res.json({ msg: "Competition updated successfully", competition });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 📌 Delete
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition)
      return res.status(404).json({ msg: "Competition not found" });

    res.json({ msg: "Competition deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
