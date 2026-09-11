const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobMatch = require("../models/JobMatch");
const InterviewSession = require("../models/InterviewSession");

const {
  generateInterviewQuestions
} = require("../services/geminiService");

const router = express.Router();


// ==========================================
// GENERATE INTERVIEW QUESTIONS
// ==========================================

router.post(
  "/generate",
  authMiddleware,
  async (req, res) => {

    try {

      const userId =
        req.user.id || req.user.userId;


      // Find latest resume
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


      // Find latest job match
      const jobMatch =
        await JobMatch.findOne({
          user: userId
        }).sort({
          createdAt: -1
        });


      const jobDescription =
        jobMatch?.jobDescription || "";


      // Generate questions using Gemini
      const questions =
        await generateInterviewQuestions(
          resume.resumeText,
          jobDescription
        );


      // Save interview session
      const interviewSession =
        await InterviewSession.create({

          user: userId,

          resumeAnalysis:
            resume._id,

          jobMatch:
            jobMatch
              ? jobMatch._id
              : null,

          jobDescription,

          questions

        });


      return res.status(201).json({

        message:
          "Interview questions generated successfully",

        interview:
          interviewSession

      });


    } catch (error) {

      console.error(
        "Interview generation error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to generate interview questions"

      });

    }

  }
);


module.exports = router;