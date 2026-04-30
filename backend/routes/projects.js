const express = require("express");
const { body, validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Helper - check if user is owner or member of project
const canAccess = (project, userId) => {
  const id = userId.toString();
  const isOwner = project.owner?._id
    ? project.owner._id.toString() === id
    : project.owner?.toString() === id;
  const isMember = project.members.some(
    (m) => (m.user?._id || m.user)?.toString() === id
  );
  return isOwner || isMember;
};

// Helper - check if user is a project-level admin
const isProjectAdmin = (project, userId) => {
  const id = userId.toString();
  const isOwner = project.owner?._id
    ? project.owner._id.toString() === id
    : project.owner?.toString() === id;
  const member = project.members.find(
    (m) => (m.user?._id || m.user)?.toString() === id
  );
  return isOwner || member?.role === "admin";
};

// GET /api/projects
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
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// POST /api/projects
router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, dueDate, color } = req.body;

    try {
      const project = await Project.create({
        name,
        description,
        dueDate,
        color,
        owner: req.user._id,
        // Creator is automatically added as project admin
        members: [{ user: req.user._id, role: "admin" }],
      });

      await project.populate("owner", "name email");
      await project.populate("members.user", "name email");

      res.status(201).json(project);
    } catch (err) {
      console.error("Create project error:", err.message);
      res.status(500).json({ message: "Failed to create project" });
    }
  }
);

// GET /api/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!canAccess(project, req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    res.json(project);
  } catch (err) {
    console.error("Get project error:", err.message);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: "Only project admins can edit this project" });
    }

    const { name, description, status, dueDate, color } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (color) project.color = color;

    await project.save();
    await project.populate("owner", "name email");
    await project.populate("members.user", "name email");

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to update project" });
  }
});

// POST /api/projects/:id/members - add a member by email
router.post("/:id/members", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: "Only project admins can add members" });
    }

    const { email, role } = req.body;
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const alreadyMember = project.members.some(
      (m) => (m.user?._id || m.user)?.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push({
      user: userToAdd._id,
      role: role === "admin" ? "admin" : "member",
    });

    await project.save();
    await project.populate("members.user", "name email");

    res.json(project);
  } catch (err) {
    console.error("Add member error:", err.message);
    res.status(500).json({ message: "Failed to add member" });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: "Only project admins can remove members" });
    }

    project.members = project.members.filter(
      (m) => (m.user?._id || m.user)?.toString() !== req.params.userId
    );

    await project.save();
    res.json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const ownerId = project.owner?._id || project.owner;
    if (ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can delete it" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;