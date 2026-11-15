// =====================================================================
// models/User.js  -  the people who can log in
// =====================================================================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },

  // IMPORTANT: this stores the HASHED password (scrambled text),
  // never the real password.
  password: { type: String, required: true },

  // Only these two roles exist. "staff" is the default.
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
});

module.exports = mongoose.model("User", userSchema);
