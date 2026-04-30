const express = require("express");
const { body, validationResult } = require("express-validator");

const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

//
// 🟢 GET tasks for a project
//
router.get("/", async (req, res) => {
  try {
    const { project: projectId, status, priority, assignedTo } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = { project: projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});


//
// 🟢 GET MY TASKS
//
router.get("/my", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "name color")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your tasks" });
  }
});


//
// 🟢 DASHBOARD
//
router.get("/dashboard", async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
    });

    const projectIds = projects.map((p) => p._id);
    const now = new Date();

    const [totalTasks, doneTasks, inProgressTasks, overdueTasks] =
      await Promise.all([
        Task.countDocuments({ project: { $in: projectIds } }),

        Task.countDocuments({
          project: { $in: projectIds },
          status: "done",
        }),

        Task.countDocuments({
          project: { $in: projectIds },
          status: "in-progress",
        }),

        Task.countDocuments({
          project: { $in: projectIds },
          status: { $ne: "done" },
          dueDate: { $lt: now },
        }),
      ]);

    res.json({
      totalTasks,
      doneTasks,
      inProgressTasks,
      overdueTasks,
      totalProjects: projects.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});


//
// 🟢 CREATE TASK (ADMIN ONLY)
//
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("project").notEmpty().withMessage("Project ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        project: projectId,
        assignedTo,
        priority,
        dueDate,
        tags,
      } = req.body;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const role = project.getMemberRole(req.user._id);

      if (role !== "admin") {
        return res.status(403).json({
          message: "Only admin can create tasks",
        });
      }

      if (assignedTo && !project.isMember(assignedTo)) {
        return res.status(400).json({
          message: "Assigned user must be project member",
        });
      }

      const task = await Task.create({
        title,
        description,
        project: projectId,
        createdBy: req.user._id,
        assignedTo: assignedTo || null,
        priority,
        dueDate: dueDate || null,
        tags: tags || [],
      });

      await task.populate("assignedTo", "name email");
      await task.populate("createdBy", "name email");

      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create task" });
    }
  }
);


//
// 🟢 UPDATE TASK
//
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const role = task.project.getMemberRole(req.user._id);

    const isCreator =
      task.createdBy.toString() === req.user._id.toString();

    const isAdmin = role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Not allowed to update this task",
      });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      tags,
    } = req.body;

    if (assignedTo !== undefined && role !== "admin") {
      return res.status(403).json({
        message: "Only admin can assign tasks",
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
});


//
// 🟢 DELETE TASK
//
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const role = project.getMemberRole(req.user._id);

    const isCreator =
      task.createdBy.toString() === req.user._id.toString();

    const isAdmin = role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Not allowed to delete this task",
      });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;