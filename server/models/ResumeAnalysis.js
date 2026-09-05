const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    resumeText: {
      type: String,
      required: true
    },

    score: {
      type: Number,
      default: 0
    },

    summary: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    strengths: {
      type: [String],
      default: []
    },

    weaknesses: {
      type: [String],
      default: []
    },

    suggestions: {
      type: [String],
      default: []
    },

    recommendedSkills: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);