const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobMatch = require("../models/JobMatch");
const CareerRoadmap = require("../models/CareerRoadmap");

const {
  analyzeCareerRoadmap
} = require("../services/geminiService");

const router = express.Router();


// ==========================================
// GENERATE CAREER ROADMAP
// ==========================================

router.post(
  "/generate",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id || req.user.userId;

      // --------------------------------------
      // Get latest resume analysis
      // --------------------------------------

      const resume =
        await ResumeAnalysis.findOne({
          user: userId
        }).sort({
          createdAt: -1
        });

      if (!resume) {
        return res.status(404).json({
          message:
            "Please upload and analyze your resume first."
        });
      }

      // --------------------------------------
      // Get latest job match
      // --------------------------------------

      const jobMatch =
        await JobMatch.findOne({
          user: userId
        }).sort({
          createdAt: -1
        });

      // --------------------------------------
      // Get missing skills
      // --------------------------------------

      const missingSkills =
        jobMatch?.missingSkills || [];

      // --------------------------------------
      // Get recommended skills
      // --------------------------------------

      const recommendedSkills =
        resume.recommendedSkills || [];

      // --------------------------------------
      // Generate roadmap using Gemini
      // --------------------------------------

      const roadmapData =
        await analyzeCareerRoadmap(
          resume.resumeText,
          recommendedSkills,
          missingSkills
        );

      // --------------------------------------
      // Save roadmap
      // --------------------------------------

      const roadmap =
        await CareerRoadmap.create({
          user: userId,

          resumeAnalysis: resume._id,

          jobMatch: jobMatch
            ? jobMatch._id
            : null,

          goal:
            roadmapData.goal ||
            "Software Developer",

          title:
            roadmapData.title ||
            "Personalized Career Roadmap",

          summary:
            roadmapData.summary || "",

          totalWeeks:
            roadmapData.totalWeeks || 4,

          weeks:
            roadmapData.weeks || []
        });

      return res.status(201).json({
        message:
          "Career roadmap generated successfully",

        roadmap
      });

    } catch (error) {
      console.error(
        "Career roadmap generation error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to generate career roadmap"
      });
    }
  }
);


// ==========================================
// GET ROADMAP HISTORY
// ==========================================

router.get(
  "/history",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id || req.user.userId;

      const roadmaps =
        await CareerRoadmap.find({
          user: userId
        })
          .sort({
            createdAt: -1
          })
          .populate(
            "resumeAnalysis",
            "fileName"
          );

      return res.status(200).json({
        roadmaps
      });

    } catch (error) {
      console.error(
        "Roadmap history error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch roadmap history"
      });
    }
  }
);


// ==========================================
// GET SINGLE ROADMAP
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id || req.user.userId;

      const roadmap =
        await CareerRoadmap.findOne({
          _id: req.params.id,
          user: userId
        })
          .populate(
            "resumeAnalysis",
            "fileName"
          )
          .populate(
            "jobMatch",
            "score missingSkills"
          );

      if (!roadmap) {
        return res.status(404).json({
          message: "Roadmap not found"
        });
      }

      return res.status(200).json({
        roadmap
      });

    } catch (error) {
      console.error(
        "Roadmap details error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch roadmap"
      });
    }
  }
);


module.exports = router;