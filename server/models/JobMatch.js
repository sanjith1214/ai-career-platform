const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema(
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

    jobDescription: {
      type: String,
      required: true
    },

    score: {
      type: Number,
      default: 0
    },

    matchedSkills: {
      type: [String],
      default: []
    },

    missingSkills: {
      type: [String],
      default: []
    },

    strengths: {
      type: [String],
      default: []
    },

    suggestions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "JobMatch",
  jobMatchSchema
);