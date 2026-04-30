const express = require("express");
const { body, validationResult } = require("express-validator");

const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const { protect } = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// all routes require login
router.use(protect);

//
// ─── GET ALL PROJECTS ─────────────────────────────
//
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

//
// ─── CREATE PROJECT (ADMIN ONLY GLOBAL ROLE) ───────
//
router.post(
  "/",
  requireRole("admin"), // 🔥 GLOBAL RBAC
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, dueDate, color } = req.body;

      const project = await Project.create({
        name: name.trim(),
        description,
        dueDate,
        color,
        owner: req.user._id,
        members: [
          {
            user: req.user._id,
            role: "admin",
          },
        ],
      });

      await project.populate("owner", "name email");
      await project.populate("members.user", "name email");

      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create project" });
    }
  }
);

//
// ─── GET SINGLE PROJECT ───────────────────────────
//
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // access control
    if (
      !project.isMember(req.user._id) &&
      project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

//
// ─── UPDATE PROJECT (PROJECT ADMIN / OWNER) ───────
//
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const role = project.getMemberRole(req.user._id);

    if (
      role !== "admin" &&
      project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { name, description, status, dueDate, color } = req.body;

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (color !== undefined) project.color = color;

    await project.save();

    await project.populate("owner", "name email");
    await project.populate("members.user", "name email");

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

//
// ─── ADD MEMBER (PROJECT ADMIN / OWNER) ───────────
//
router.post("/:id/members", async (req, res) => {
  try {
    const { email, role } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const requesterRole = project.getMemberRole(req.user._id);

    if (
      requesterRole !== "admin" &&
      project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      project.isMember(userToAdd._id) ||
      project.owner.toString() === userToAdd._id.toString()
    ) {
      return res.status(400).json({ message: "User already in project" });
    }

    project.members.push({
      user: userToAdd._id,
      role: role === "admin" ? "admin" : "member",
    });

    await project.save();
    await project.populate("members.user", "name email");

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
});

//
// ─── REMOVE MEMBER (PROJECT ADMIN / OWNER) ────────
//
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const requesterRole = project.getMemberRole(req.user._id);

    if (
      requesterRole !== "admin" &&
      project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove owner" });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove member" });
  }
});

//
// ─── DELETE PROJECT (OWNER ONLY) ──────────────────
//
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can delete project" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;