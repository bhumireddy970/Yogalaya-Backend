import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * 📌 Register User
 */
router.post("/register-user", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isApproved: false, // needs admin approval
    });

    await user.save();

    res.json({ msg: "User registered successfully. Await admin approval." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * 📌 Register Admin (just like user, but auto-approved)
 */
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isApproved: true, // admins don’t need approval
    });

    await admin.save();

    res.json({ msg: "Admin registered successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * 📌 Login (Admin or User)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.role !== "admin" && !user.isApproved) {
      return res.status(403).json({ msg: "Admin approval pending" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      msg: `${user.role} login successful`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Approve User (Admin only)
 */
router.put("/approve/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json({ msg: "User approved successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get All Users (Admin only, exclude admins)
 */
router.get("/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    // Fetch only users (exclude admins)
    const users = await User.find({ role: "user" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
