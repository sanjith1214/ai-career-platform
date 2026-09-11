const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "technical",
        "behavioral",
        "resume-based"
      ],
      required: true
    },

    difficulty: {
      type: String,
      enum: [
        "easy",
        "medium",
        "hard"
      ],
      default: "medium"
    },

    answer: {
      type: String,
      default: ""
    },

    score: {
      type: Number,
      default: null
    },

    feedback: {
      type: String,
      default: ""
    }
  }
);


const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    resumeAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeAnalysis",
      required: true
    },

    jobMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobMatch",
      default: null
    },

    jobDescription: {
      type: String,
      default: ""
    },

    questions: {
      type: [interviewQuestionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);