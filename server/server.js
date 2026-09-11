const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();

// ==========================================
// DATABASE
// ==========================================

const connectDB =
  require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes =
  require("./routes/authRoutes");

const resumeRoutes =
  require("./routes/resumeRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const roadmapRoutes =
  require("./routes/roadmapRoutes");

const interviewRoutes =
  require("./routes/interviewRoutes");

// ==========================================
// EXPRESS APP
// ==========================================

const app =
  express();

// ==========================================
// DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(
  express.json()
);

// ==========================================
// API ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/job",
  jobRoutes
);

app.use(
  "/api/roadmap",
  roadmapRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "AI Career Platform API is running"
    });
  }
);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "Server error:",
      err
    );

    res.status(500).json({
      message:
        "Internal server error"
    });
  }
);

// ==========================================
// SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);