const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // removed index: true here — was causing duplicate index warning
    },
    members: [memberSchema],
    status: {
      type: String,
      enum: ["active", "completed", "on-hold"],
      default: "active",
    },
    dueDate: {
      type: Date,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);