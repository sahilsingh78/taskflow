const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

//
// 🟢 GET ALL USERS (ADMIN ONLY)
//
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied (Admin only)",
      });
    }

    const users = await User.find().select("-password");

    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// 🟢 GET SINGLE USER
//
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// 🟢 UPDATE USER
//
router.put("/:id", async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Only admin OR self can update
    const isSelf = req.user.id === user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        message: "Not allowed to update this user",
      });
    }

    // 🔒 Only admin can change role
    if (role && !isAdmin) {
      return res.status(403).json({
        message: "Only admin can change roles",
      });
    }

    user.name = name || user.name;
    if (role && isAdmin) user.role = role;

    const updatedUser = await user.save();

    res.json({
      message: "User updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// 🟢 DELETE USER
//
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelf = req.user.id === user._id.toString();
    const isAdmin = req.user.role === "admin";

    // 🔒 Only admin OR self
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        message: "Not allowed to delete this user",
      });
    }

    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;