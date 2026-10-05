const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const ResumeAnalysis =
  require("../models/ResumeAnalysis");

const JobMatch =
  require("../models/JobMatch");

const InterviewSession =
  require("../models/InterviewSession");

const {
  generateInterviewQuestions,
  evaluateInterviewAnswer
} = require("../services/geminiService");

const router = express.Router();


// Generate interview questions

router.post(
  "/generate",
  authMiddleware,
  async (req, res) => {

    try {

      // Get user

      const userId =
        req.user.id ||
        req.user.userId;


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


      // Get job description

      const jobDescription =
        jobMatch?.jobDescription ||
        "";


      // Generate questions

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

          jobDescription:
            jobDescription,

          questions:
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


// Evaluate interview answer

router.post(
  "/:sessionId/question/:questionId/evaluate",
  authMiddleware,
  async (req, res) => {

    try {

      // Get user

      const userId =
        req.user.id ||
        req.user.userId;


      // Get answer

      const {
        answer
      } = req.body;


      // Validate answer

      if (
        !answer ||
        !answer.trim()
      ) {

        return res.status(400).json({

          message:
            "Please provide an answer"

        });

      }


      // Find interview session

      const interviewSession =
        await InterviewSession.findOne({

          _id:
            req.params.sessionId,

          user:
            userId

        });


      if (!interviewSession) {

        return res.status(404).json({

          message:
            "Interview session not found"

        });

      }


      // Find resume

      const resumeAnalysis =
        await ResumeAnalysis.findOne({

          _id:
            interviewSession.resumeAnalysis,

          user:
            userId

        });


      if (!resumeAnalysis) {

        return res.status(404).json({

          message:
            "Resume analysis not found"

        });

      }


      // Find question

      const question =
        interviewSession.questions.id(
          req.params.questionId
        );


      if (!question) {

        return res.status(404).json({

          message:
            "Interview question not found"

        });

      }


      // Evaluate answer with Gemini

      const evaluation =
        await evaluateInterviewAnswer(

          question.question,

          answer.trim(),

          resumeAnalysis.resumeText,

          interviewSession.jobDescription

        );


      // Save answer

      question.answer =
        answer.trim();


      // Save score

      question.score =
        evaluation.score;


      // Save feedback

      question.feedback =
        evaluation.feedback;


      // Save strengths

      question.strengths =
        evaluation.strengths || [];


      // Save improvements

      question.improvements =
        evaluation.improvements || [];


      // Save to MongoDB

      await interviewSession.save();


      return res.status(200).json({

        message:
          "Answer evaluated successfully",

        question

      });

    } catch (error) {

      console.error(
        "Interview answer evaluation error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to evaluate interview answer"

      });

    }

  }
);


// Export router

module.exports =
  router;