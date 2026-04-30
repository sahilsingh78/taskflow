const mongoose = require("mongoose");

// 🔹 Member schema
const memberSchema = new mongoose.Schema(
  {
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
  },
  { _id: false } // cleaner (no extra _id per member)
);


// 🔹 Project schema
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    members: {
      type: [memberSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "completed", "on-hold"],
      default: "active",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    color: {
      type: String,
      default: "#6366f1",
    },
  },
  { timestamps: true }
);


// 🔥 INDEXES (performance)
projectSchema.index({ owner: 1 });
projectSchema.index({ "members.user": 1 });


// 🔥 HELPER METHODS

// check if user is part of project
projectSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString()
  );
};


// get role inside project
projectSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};


// 🔥 ADD MEMBER SAFELY
projectSchema.methods.addMember = function (userId, role = "member") {
  if (this.isMember(userId)) return false;

  this.members.push({
    user: userId,
    role,
  });

  return true;
};


// 🔥 REMOVE MEMBER
projectSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );
};


// 🔥 PRE-SAVE HOOK (ensure owner is admin)
projectSchema.pre("save", function (next) {
  const isOwnerMember = this.members.some(
    (m) => m.user.toString() === this.owner.toString()
  );

  if (!isOwnerMember) {
    this.members.push({
      user: this.owner,
      role: "admin",
    });
  }

  next();
});


module.exports = mongoose.model("Project", projectSchema);