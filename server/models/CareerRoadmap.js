const mongoose = require("mongoose");

const careerRoadmapSchema = new mongoose.Schema(
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

    goal: {
      type: String,
      default: "Software Developer"
    },

    title: {
      type: String,
      required: true
    },

    summary: {
      type: String,
      default: ""
    },

    totalWeeks: {
      type: Number,
      default: 4
    },

    weeks: [
      {
        week: {
          type: Number,
          required: true
        },

        title: {
          type: String,
          required: true
        },

        objective: {
          type: String,
          default: ""
        },

        skills: {
          type: [String],
          default: []
        },

        topics: {
          type: [String],
          default: []
        },

        tasks: {
          type: [String],
          default: []
        },

        project: {
          type: String,
          default: ""
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "CareerRoadmap",
  careerRoadmapSchema
);