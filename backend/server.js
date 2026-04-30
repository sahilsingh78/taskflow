require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ─── IMPORT ROUTES ───────────────── */
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

/* ─── GLOBAL MIDDLEWARE ───────────────── */

/* 🔥 CORS (Production Safe) */
app.use(
  cors({
    origin: [
      "https://taskflow-lake-seven.vercel.app",
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

/* JSON parser */
app.use(express.json());

/* ─── HEALTH CHECK ───────────────── */
app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow API is running 🚀",
    version: "1.0.0",
    status: "OK",
  });
});

/* ─── API ROUTES ───────────────── */
/* authMiddleware + requireRole are used INSIDE routes */

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

/* ─── 404 HANDLER ───────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ─── GLOBAL ERROR HANDLER ───────────────── */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ─── DATABASE CONNECTION ───────────────── */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    autoIndex: true, // useful for development
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ─── GRACEFUL SHUTDOWN (OPTIONAL BUT 🔥) */
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB disconnected");
  process.exit(0);
});