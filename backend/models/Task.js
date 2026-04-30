const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // allow null
          if (!value) return true;
          return value instanceof Date;
        },
        message: "Invalid due date",
      },
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);


// 🔥 INDEXES (performance boost)
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

// 🔥 TEXT SEARCH (optional but powerful)
taskSchema.index({ title: "text", description: "text" });


// 🔥 VIRTUAL FIELD → overdue check
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  if (this.status === "done") return false;

  return new Date() > this.dueDate;
});


// include virtuals in JSON
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });


module.exports = mongoose.model("Task", taskSchema);