const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobMatch = require("../models/JobMatch");

const {
  analyzeJobMatch
} = require("../services/geminiService");

const router = express.Router();


// =====================================================
// POST /api/job/match
// Analyze a job description against the user's resume
// =====================================================

router.post(
  "/match",
  authMiddleware,
  async (req, res) => {
    try {
      const { jobDescription } = req.body;

      // Check if job description exists
      if (
        !jobDescription ||
        !jobDescription.trim()
      ) {
        return res.status(400).json({
          message: "Job description is required"
        });
      }

      // Get logged-in user's ID
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      // Find user's latest resume analysis
      const resume =
        await ResumeAnalysis.findOne({
          user: userId
        }).sort({
          createdAt: -1
        });

      // User must analyze a resume first
      if (!resume) {
        return res.status(404).json({
          message:
            "Please analyze your resume first"
        });
      }

      console.log(
        "Resume found:",
        resume.fileName
      );

      console.log(
        "Starting AI job matching..."
      );

      // Send resume and job description
      // to Gemini
      const analysis =
        await analyzeJobMatch(
          resume.resumeText,
          jobDescription
        );

      console.log(
        "AI job matching completed"
      );

      // Save result in MongoDB
      const jobMatch =
        await JobMatch.create({
          user: userId,

          resumeAnalysis:
            resume._id,

          jobDescription:
            jobDescription,

          score:
            analysis.score,

          matchedSkills:
            analysis.matchedSkills,

          missingSkills:
            analysis.missingSkills,

          strengths:
            analysis.strengths,

          suggestions:
            analysis.suggestions
        });

      // Return result
      res.status(201).json({
        message:
          "Job matching completed successfully",

        match: jobMatch
      });

    } catch (error) {
      console.error(
        "Job matching error:",
        error
      );

      res.status(500).json({
        message:
          "Job matching failed"
      });
    }
  }
);


// =====================================================
// GET /api/job/history
// Get all previous job matches
// =====================================================

router.get(
  "/history",
  authMiddleware,
  async (req, res) => {
    try {
      // Get logged-in user's ID
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      // Find all matches belonging to this user
      const history =
        await JobMatch.find({
          user: userId
        })
          .sort({
            createdAt: -1
          })
          .populate(
            "resumeAnalysis",
            "fileName"
          );

      res.json({
        matches: history
      });

    } catch (error) {
      console.error(
        "Job match history error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch job match history"
      });
    }
  }
);


// =====================================================
// GET /api/job/:id
// Get details of one particular job match
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      // Get logged-in user's ID
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      // Find the requested job match
      // and make sure it belongs to this user
      const jobMatch =
        await JobMatch.findOne({
          _id: req.params.id,
          user: userId
        }).populate(
          "resumeAnalysis",
          "fileName"
        );

      // Match does not exist
      if (!jobMatch) {
        return res.status(404).json({
          message:
            "Job match not found"
        });
      }

      // Send match details
      res.json({
        match: jobMatch
      });

    } catch (error) {
      console.error(
        "Job match details error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch job match details"
      });
    }
  }
);


module.exports = router;