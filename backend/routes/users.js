const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ─── GET ALL USERS (ADMIN PURPOSE) ───────────────── */
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ─── GET SINGLE USER ───────────────── */
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ─── UPDATE USER ───────────────── */
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.json({
      message: "User updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ─── DELETE USER ───────────────── */
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;