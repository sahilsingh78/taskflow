const Project = require("../models/Project");
const Task = require("../models/Task");

//
// 🟢 CREATE PROJECT
//
exports.createProject = async (req, res) => {
  try {
    const { name, description, dueDate, color } = req.body;

    const project = await Project.create({
      name,
      description,
      dueDate,
      color,
      owner: req.user.id, // 🔥 important
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create project" });
  }
};


//
// 🟢 GET ALL PROJECTS (only where user is member)
//
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user.id,
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};


//
// 🟢 GET SINGLE PROJECT
//
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};


//
// 🟢 UPDATE PROJECT (admin only)
//
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const role = project.getMemberRole(req.user.id);

    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can update project" });
    }

    const { name, description, status, dueDate, color } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (color !== undefined) project.color = color;

    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
};


//
// 🟢 DELETE PROJECT (admin only)
//
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const role = project.getMemberRole(req.user.id);

    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete project" });
    }

    // 🔥 also delete related tasks
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
};


//
// 🟢 ADD MEMBER (admin only)
//
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userRole = project.getMemberRole(req.user.id);

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const added = project.addMember(userId, role);

    if (!added) {
      return res.status(400).json({ message: "User already a member" });
    }

    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
};


//
// 🟢 REMOVE MEMBER (admin only)
//
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userRole = project.getMemberRole(req.user.id);

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    project.removeMember(req.params.userId);

    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};


//
// 🟢 GET MEMBERS
//
exports.getMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};