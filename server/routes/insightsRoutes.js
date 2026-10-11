
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobMatch = require("../models/JobMatch");
const CareerRoadmap = require("../models/CareerRoadmap");

const router = express.Router();

// Get career insights for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = 
      req.user.id || 
      req.user.userId ||
      req.user._id;

    const [
      resumeCount,
      jobMatchCount,
      roadmapCount,
      latestResume,
      latestJobMatch,
      latestRoadmap,
      resumes,
      jobMatches
    ] = await Promise.all([
      ResumeAnalysis.countDocuments({ user: userId }),
      JobMatch.countDocuments({ user: userId }),
      CareerRoadmap.countDocuments({ user: userId }),

      ResumeAnalysis.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("fileName score skills recommendedSkills suggestions createdAt"),

      JobMatch.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("score matchedSkills missingSkills suggestions createdAt"),

      CareerRoadmap.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select("title goal totalWeeks createdAt"),

      ResumeAnalysis.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("skills recommendedSkills"),

      JobMatch.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("matchedSkills missingSkills suggestions")
    ]);

    // Count recurring skills across recent analyses
    const countSkills = (records, field) => {
      const skillCounts = new Map();

      records.forEach((record) => {
        const seenInRecord = new Set();

        (record[field] || []).forEach((skill) => {
          if (typeof skill !== "string" || !skill.trim()) {
            return;
          }

          const key = skill.trim().toLowerCase();

          if (seenInRecord.has(key)) {
            return;
          }

          seenInRecord.add(key);

          const existing = skillCounts.get(key);

          skillCounts.set(key, {
            name: existing?.name || skill.trim(),
            count: (existing?.count || 0) + 1
          });
        });
      });

      return Array.from(skillCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    };

    const topSkills = countSkills(
      resumes,
      "skills"
    );

    const prioritySkills = countSkills(
      jobMatches,
      "missingSkills"
    );

    // Build recommendations from existing analysis results
    const recommendations = [];

    if (!latestResume) {
      recommendations.push(
        "Upload your resume to receive personalized career insights."
      );
    } else {
      if (latestResume.score < 70) {
        recommendations.push(
          "Improve your resume using the suggestions from your latest resume analysis."
        );
      }

      if (!latestJobMatch) {
        recommendations.push(
          "Analyze your resume against a target job description to discover skill gaps."
        );
      }

      if (prioritySkills.length > 0) {
        recommendations.push(
          `Prioritize learning ${prioritySkills
            .slice(0, 3)
            .map((skill) => skill.name)
            .join(", ")} based on your recent job-match results.`
        );
      }

      if (!latestRoadmap) {
        recommendations.push(
          "Generate a career roadmap to organize your learning into weekly goals."
        );
      }

      (latestResume.suggestions || [])
        .slice(0, 2)
        .forEach((suggestion) => {
          recommendations.push(suggestion);
        });

      (latestJobMatch?.suggestions || [])
        .slice(0, 2)
        .forEach((suggestion) => {
          recommendations.push(suggestion);
        });
    }

    return res.status(200).json({
      stats: {
        resumeAnalyses: resumeCount,
        jobMatches: jobMatchCount,
        careerRoadmaps: roadmapCount
      },
      latestResume,
      latestJobMatch,
      latestRoadmap,
      topSkills,
      prioritySkills,
      recommendations: [...new Set(recommendations)].slice(0, 6)
    });
  } catch (error) {
    console.error("Career insights error:", error);

    return res.status(500).json({
      message: "Failed to load career insights"
    });
  }
});

module.exports = router;
