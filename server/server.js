
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const insightsRoutes = require("./routes/insightsRoutes");

// Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/insights", insightsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AI Career Platform API is running"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: "Internal server error"
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
