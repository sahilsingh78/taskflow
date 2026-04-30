const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect routes
const protect = async (req, res, next) => {
  let token;

  // check header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// admin-only access
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };