// =====================================================================
// middleware/auth.js  -  security guards for our routes
// A middleware is a function that runs BEFORE the route.
// If everything is fine it calls next() to let the request continue.
// =====================================================================
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// GUARD 1: "protect" -> only logged-in users may pass
async function protect(req, res, next) {
  // React sends the token in a header that looks like:  Authorization: Bearer abc123...
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in first" });
  }

  try {
    const token = header.split(" ")[1]; // take only the part after "Bearer "

    // Check the token is real and not expired. If not, jwt.verify throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user the token belongs to and attach them to the request,
    // so the next function can use req.user
    req.user = await User.findById(decoded.id).select("-password"); // "-password" = don't load the password
    if (!req.user) {
      return res.status(401).json({ message: "User not found. Please log in again" });
    }

    next(); // everything is fine, continue to the route
  } catch (err) {
    return res.status(401).json({ message: "Login expired. Please log in again" });
  }
}

// GUARD 2: "adminOnly" -> only the admin may pass (always used AFTER protect)
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only the admin can do this" });
  }
  next();
}

module.exports = { protect, adminOnly };
