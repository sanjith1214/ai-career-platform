const express = require("express");
const multer = require("multer");

// PDF parser
const { CanvasFactory } = require("pdf-parse/worker");
const { PDFParse } = require("pdf-parse");

// Authentication
const authMiddleware = require("../middleware/authMiddleware");

// Gemini service
const { analyzeResume } = require("../services/geminiService");

// MongoDB model
const ResumeAnalysis = require("../models/ResumeAnalysis");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }

  }
});


/*
|--------------------------------------------------------------------------
| POST /api/resume/analyze
|--------------------------------------------------------------------------
|
| Upload resume
|       ↓
| Extract PDF text
|       ↓
| Gemini AI
|       ↓
| Save analysis to MongoDB
|
|--------------------------------------------------------------------------
*/

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),

  async (req, res) => {

    let parser = null;

    try {

      console.log("=================================");
      console.log("Resume analysis started");
      console.log("=================================");


      /*
      |--------------------------------------------------------------------------
      | Check uploaded file
      |--------------------------------------------------------------------------
      */

      if (!req.file) {

        return res.status(400).json({
          message: "Please upload a PDF resume"
        });

      }


      console.log(
        "File received:",
        req.file.originalname
      );

      console.log(
        "File size:",
        req.file.size
      );

      console.log(
        "File type:",
        req.file.mimetype
      );


      /*
      |--------------------------------------------------------------------------
      | Check PDF header
      |--------------------------------------------------------------------------
      */

      const pdfHeader = req.file.buffer
        .subarray(0, 8)
        .toString("ascii");


      console.log(
        "PDF header:",
        pdfHeader
      );


      if (!pdfHeader.startsWith("%PDF-")) {

        return res.status(400).json({

          message:
            "The uploaded file is not a valid PDF. Please save/export your resume as a new PDF and try again."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Create PDF parser
      |--------------------------------------------------------------------------
      */

      parser = new PDFParse({

        data: req.file.buffer,

        CanvasFactory

      });


      /*
      |--------------------------------------------------------------------------
      | Extract PDF text
      |--------------------------------------------------------------------------
      */

      const result =
        await parser.getText();


      const extractedText =
        result.text;


      console.log(
        "PDF text extracted successfully"
      );

      console.log(
        "Extracted characters:",
        extractedText.length
      );


      /*
      |--------------------------------------------------------------------------
      | Check extracted text
      |--------------------------------------------------------------------------
      */

      if (
        !extractedText ||
        extractedText.trim().length === 0
      ) {

        return res.status(400).json({

          message:
            "Could not extract text from this PDF. Please upload a text-based PDF resume."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Send Resume to Gemini
      |--------------------------------------------------------------------------
      */

      console.log(
        "Sending resume to Gemini AI..."
      );


      const aiAnalysis =
        await analyzeResume(
          extractedText
        );


      console.log(
        "Gemini analysis completed successfully"
      );


      /*
      |--------------------------------------------------------------------------
      | Get Logged-in User ID
      |--------------------------------------------------------------------------
      */

      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;


      if (!userId) {

        return res.status(401).json({

          message:
            "User information not found in token"

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Save Analysis to MongoDB
      |--------------------------------------------------------------------------
      */

      const savedAnalysis =
        await ResumeAnalysis.create({

          user: userId,

          fileName:
            req.file.originalname,

          resumeText:
            extractedText,

          score:
            aiAnalysis.score || 0,

          summary:
            aiAnalysis.summary || "",

          skills:
            aiAnalysis.skills || [],

          strengths:
            aiAnalysis.strengths || [],

          weaknesses:
            aiAnalysis.weaknesses || [],

          suggestions:
            aiAnalysis.suggestions || [],

          recommendedSkills:
            aiAnalysis.recommendedSkills || []

        });


      console.log(
        "Resume analysis saved to MongoDB"
      );

      console.log(
        "Analysis ID:",
        savedAnalysis._id
      );


      /*
      |--------------------------------------------------------------------------
      | Final Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        message:
          "Resume analyzed successfully",

        text:
          extractedText,

        analysis:
          aiAnalysis,

        analysisId:
          savedAnalysis._id

      });


    } catch (error) {

      console.error(
        "================================="
      );

      console.error(
        "RESUME ANALYSIS ERROR"
      );

      console.error(
        "================================="
      );

      console.error(error);

      console.error(
        "================================="
      );


      return res.status(500).json({

        message:
          "Failed to process resume",

        error:
          error.message

      });


    } finally {

      /*
      |--------------------------------------------------------------------------
      | Destroy PDF parser
      |--------------------------------------------------------------------------
      */

      if (parser) {

        try {

          await parser.destroy();

          console.log(
            "PDF parser destroyed"
          );

        } catch (error) {

          console.error(
            "PDF parser cleanup error:",
            error.message
          );

        }

      }

    }

  }
);


/*
|--------------------------------------------------------------------------
| GET /api/resume/history
|--------------------------------------------------------------------------
|
| Get all resume analyses belonging
| to the logged-in user.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  authMiddleware,

  async (req, res) => {

    try {

      console.log(
        "Fetching resume history..."
      );


      /*
      |--------------------------------------------------------------------------
      | Get User ID
      |--------------------------------------------------------------------------
      */

      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;


      if (!userId) {

        return res.status(401).json({

          message:
            "User information not found in token"

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Find User's Analyses
      |--------------------------------------------------------------------------
      */

      const analyses =
        await ResumeAnalysis
          .find({
            user: userId
          })
          .sort({
            createdAt: -1
          });


      console.log(
        "Resume history found:",
        analyses.length
      );


      /*
      |--------------------------------------------------------------------------
      | Send History
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        analyses

      });

    } catch (error) {

      console.error(
        "Resume history error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to fetch resume history"

      });

    }

  }
);


/*
|--------------------------------------------------------------------------
| GET /api/resume/:id
|--------------------------------------------------------------------------
|
| Get ONE specific resume analysis.
|
| The analysis must belong to the
| currently logged-in user.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,

  async (req, res) => {

    try {

      console.log(
        "Fetching resume analysis:",
        req.params.id
      );


      /*
      |--------------------------------------------------------------------------
      | Get User ID
      |--------------------------------------------------------------------------
      */

      const userId =
        req.user.id ||
        req.user.userId ||
        req.user._id;


      if (!userId) {

        return res.status(401).json({

          message:
            "User information not found in token"

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Find Specific Analysis
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | We check BOTH:
      |
      | _id
      | user
      |
      | This prevents one user from accessing
      | another user's resume.
      |
      |--------------------------------------------------------------------------
      */

      const analysis =
        await ResumeAnalysis.findOne({

          _id:
            req.params.id,

          user:
            userId

        });


      /*
      |--------------------------------------------------------------------------
      | Analysis Not Found
      |--------------------------------------------------------------------------
      */

      if (!analysis) {

        return res.status(404).json({

          message:
            "Resume analysis not found"

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Send Analysis
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        analysis

      });

    } catch (error) {

      console.error(
        "Resume analysis fetch error:",
        error
      );


      return res.status(500).json({

        message:
          "Failed to fetch resume analysis"

      });

    }

  }
);


/*
|--------------------------------------------------------------------------
| Multer / Upload Error Handler
|--------------------------------------------------------------------------
*/

router.use(
  (error, req, res, next) => {

    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code === "LIMIT_FILE_SIZE"
      ) {

        return res.status(400).json({

          message:
            "File is too large. Maximum allowed size is 5MB."

        });

      }


      return res.status(400).json({

        message:
          error.message

      });

    }


    if (error) {

      return res.status(400).json({

        message:
          error.message

      });

    }


    next();

  }
);


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

module.exports = router;