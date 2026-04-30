const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ─── Generate JWT ───────────────── */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ─── REGISTER ───────────────── */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email is already registered",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === "admin" ? "admin" : "member",
      });

      res.status(201).json({
        user,
        token: generateToken(user._id),
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* ─── LOGIN ───────────────── */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      res.json({
        user,
        token: generateToken(user._id),
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* ─── GET CURRENT USER ───────────────── */
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;