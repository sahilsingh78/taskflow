const Task = require("../models/Task");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      dueDate,
      priority,
      tags,
    } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      priority,
      tags,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task" });
  }
};


// GET TASKS
exports.getTasks = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, priority },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};


// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};