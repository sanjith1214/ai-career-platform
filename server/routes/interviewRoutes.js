
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
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

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

      const jobMatch =
        await JobMatch.findOne({
          user: userId
        }).sort({
          createdAt: -1
        });

      const jobDescription =
        jobMatch?.jobDescription || "";

      const questions =
        await generateInterviewQuestions(
          resume.resumeText,
          jobDescription
        );

      const interviewSession =
        await InterviewSession.create({
          user: userId,
          resumeAnalysis: resume._id,
          jobMatch: jobMatch
            ? jobMatch._id
            : null,
          jobDescription,
          questions
        });

      return res.status(201).json({
        message:
          "Interview questions generated successfully",
        interview: interviewSession
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


// Get interview history

router.get(
  "/history",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      const interviews =
        await InterviewSession.find({
          user: userId
        })
          .sort({
            createdAt: -1
          })
          .select(
            "questions createdAt updatedAt jobDescription"
          )
          .lean();

      const history = interviews.map(
        (interview) => {
          const questions =
            interview.questions || [];

          const evaluatedQuestions =
            questions.filter(
              (question) =>
                typeof question.score === "number"
            );

          const totalScore =
            evaluatedQuestions.reduce(
              (sum, question) =>
                sum + question.score,
              0
            );

          const averageScore =
            evaluatedQuestions.length > 0
              ? Math.round(
                  (totalScore /
                    evaluatedQuestions.length) *
                    10
                ) / 10
              : null;

          return {
            _id: interview._id,
            createdAt: interview.createdAt,
            updatedAt: interview.updatedAt,
            totalQuestions: questions.length,
            answeredQuestions:
              evaluatedQuestions.length,
            averageScore,
            status:
              evaluatedQuestions.length === 0
                ? "Not started"
                : evaluatedQuestions.length ===
                    questions.length
                  ? "Completed"
                  : "In progress"
          };
        }
      );

      return res.status(200).json({
        interviews: history
      });
    } catch (error) {
      console.error(
        "Interview history error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch interview history"
      });
    }
  }
);


// Get interview progress summary

router.get(
  "/progress",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      const interviews =
        await InterviewSession.find({
          user: userId
        })
          .select("questions createdAt")
          .sort({
            createdAt: 1
          })
          .lean();

      let totalQuestions = 0;
      let answeredQuestions = 0;
      let totalScore = 0;
      let firstAverage = null;
      let latestAverage = null;

      const sessions = interviews.map(
        (interview) => {
          const questions =
            interview.questions || [];

          const evaluated =
            questions.filter(
              (question) =>
                typeof question.score === "number"
            );

          const sessionScore =
            evaluated.reduce(
              (sum, question) =>
                sum + question.score,
              0
            );

          const average =
            evaluated.length > 0
              ? Math.round(
                  (sessionScore /
                    evaluated.length) *
                    10
                ) / 10
              : null;

          totalQuestions += questions.length;
          answeredQuestions += evaluated.length;
          totalScore += sessionScore;

          if (average !== null) {
            if (firstAverage === null) {
              firstAverage = average;
            }

            latestAverage = average;
          }

          return {
            _id: interview._id,
            createdAt: interview.createdAt,
            totalQuestions: questions.length,
            answeredQuestions: evaluated.length,
            averageScore: average
          };
        }
      );

      const overallAverage =
        answeredQuestions > 0
          ? Math.round(
              (totalScore / answeredQuestions) *
                10
            ) / 10
          : null;

      const improvement =
        firstAverage !== null &&
        latestAverage !== null
          ? Math.round(
              (latestAverage - firstAverage) *
                10
            ) / 10
          : null;

      return res.status(200).json({
        totalSessions: interviews.length,
        totalQuestions,
        answeredQuestions,
        overallAverage,
        firstAverage,
        latestAverage,
        improvement,
        sessions
      });
    } catch (error) {
      console.error(
        "Interview progress error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch interview progress"
      });
    }
  }
);


// Evaluate an interview answer

router.post(
  "/:sessionId/question/:questionId/evaluate",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;

      const { answer } = req.body;

      if (
        typeof answer !== "string" ||
        !answer.trim()
      ) {
        return res.status(400).json({
          message:
            "Please provide an answer"
        });
      }

      const interviewSession =
        await InterviewSession.findOne({
          _id: req.params.sessionId,
          user: userId
        });

      if (!interviewSession) {
        return res.status(404).json({
          message:
            "Interview session not found"
        });
      }

      const resumeAnalysis =
        await ResumeAnalysis.findOne({
          _id: interviewSession.resumeAnalysis,
          user: userId
        });

      if (!resumeAnalysis) {
        return res.status(404).json({
          message:
            "Resume analysis not found"
        });
      }

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

      const evaluation =
        await evaluateInterviewAnswer(
          question.question,
          answer.trim(),
          resumeAnalysis.resumeText,
          interviewSession.jobDescription
        );

      question.answer = answer.trim();
      question.score = evaluation.score;
      question.feedback =
        evaluation.feedback;
      question.strengths =
        evaluation.strengths || [];
      question.improvements =
        evaluation.improvements || [];

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

module.exports = router;
