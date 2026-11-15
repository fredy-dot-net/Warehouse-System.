// =====================================================================
// routes/authRoutes.js  -  LOGIN
// URL:  POST /api/auth/login
// =====================================================================
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// "async" lets us use "await", which means "wait here until the database answers"
router.post("/login", async (req, res) => {
  try {
    // 1. Read what the user typed (React sent it in the request body)
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Enter username and password" });
    }

    // 2. Look for this username in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    // 3. Compare the typed password with the hashed one in the database
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    // 4. Make a login token (like a digital ID card) valid for 1 day
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // 5. Send the token and basic user info back to React
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
