import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Achievement from "../models/Achievement.js";

const router = express.Router();

// Storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ➤ Create achievement
router.post(
  "/",
  upload.fields([{ name: "photos" }, { name: "videos" }]),
  async (req, res) => {
    try {
      const photos = req.files.photos
        ? req.files.photos.map((f) => f.path)
        : [];
      const videos = req.files.videos
        ? req.files.videos.map((f) => f.path)
        : [];

      const achievement = new Achievement({
        title: req.body.title,
        description: req.body.description,
        photos,
        videos,
      });

      await achievement.save();
      res.status(201).json(achievement);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ➤ Get all achievements
router.get("/", async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ Update achievement
router.put(
  "/:id",
  upload.fields([{ name: "photos" }, { name: "videos" }]),
  async (req, res) => {
    try {
      const photos = req.files.photos
        ? req.files.photos.map((f) => f.path)
        : [];
      const videos = req.files.videos
        ? req.files.videos.map((f) => f.path)
        : [];

      const updated = await Achievement.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: req.body.description,
          ...(photos.length && { photos }),
          ...(videos.length && { videos }),
        },
        { new: true }
      );

      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// ➤ Delete achievement
router.delete("/:id", async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: "Achievement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
