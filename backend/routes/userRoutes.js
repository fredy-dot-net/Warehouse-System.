// =====================================================================
// routes/userRoutes.js  -  the admin manages staff accounts
// Every route here starts with /api/users and is for ADMIN ONLY
// =====================================================================
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// ---------- READ: list all users (never send the passwords) ----------
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- CREATE: add a user ----------
// POST /api/users    body: { username, password, role }
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Enter a username and a password" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must have at least 6 characters" });
    }

    // Hash the password before saving (never store the real password)
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      role: role === "admin" ? "admin" : "staff", // anything else becomes "staff"
    });

    res.status(201).json({ _id: user._id, username: user.username, role: user.role });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This username is already taken" });
    }
    res.status(400).json({ message: err.message });
  }
});

// ---------- DELETE: remove a user ----------
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    // The admin must not delete their own account (they would lock themselves out)
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
