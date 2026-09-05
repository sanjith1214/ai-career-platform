import { useState } from "react";

function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setMessage("");
    setResumeText("");
    setAnalysis(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check PDF
    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setMessage("Please select a PDF file");
      return;
    }

    // Check file size
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setMessage("PDF must be smaller than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select your resume first");
      return;
    }

    // Get JWT token
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login again");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResumeText("");
      setAnalysis(null);

      const formData = new FormData();

      formData.append("resume", file);

      /*
      --------------------------------------------------
      Send PDF + JWT token to backend
      --------------------------------------------------
      */

      const response = await fetch(
        "http://localhost:5000/api/resume/analyze",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Resume analysis failed"
        );
      }

      /*
      --------------------------------------------------
      Backend successfully analyzed resume
      --------------------------------------------------
      */

      setMessage("Resume analyzed successfully!");

      setResumeText(data.text);

      setAnalysis(data.analysis);

    } catch (error) {
      console.error("Resume analysis error:", error);

      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">

      <div className="resume-container">

        {/* ==============================
            HEADER
        ============================== */}

        <div className="resume-header">

          <p className="resume-label">
            AI RESUME ANALYZER
          </p>

          <h1>
            Analyze Your Resume
          </h1>

          <p>
            Upload your resume and get AI-powered
            insights about your skills and career.
          </p>

        </div>


        {/* ==============================
            UPLOAD CARD
        ============================== */}

        <div className="resume-upload-card">

          <div className="resume-upload-icon">
            📄
          </div>

          <h2>
            Upload Your Resume
          </h2>

          <p>
            Upload your resume in PDF format.
            Maximum file size: 5MB.
          </p>


          {/* File input */}

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
          />


          {/* Selected file */}

          {file && (
            <div className="resume-selected-file">

              <strong>
                Selected:
              </strong>{" "}

              {file.name}

            </div>
          )}


          {/* Analyze button */}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>


          {/* Message */}

          {message && (
            <p className="resume-message">
              {message}
            </p>
          )}

        </div>


        {/* ==============================
            AI ANALYSIS
        ============================== */}

        {analysis && (
          <div className="resume-analysis-card">

            {/* Score */}

            <div className="analysis-section">

              <h2>
                Resume Score
              </h2>

              <p className="resume-score">
                {analysis.score}/100
              </p>

            </div>


            {/* Summary */}

            <div className="analysis-section">

              <h2>
                📋 Summary
              </h2>

              <p>
                {analysis.summary}
              </p>

            </div>


            {/* Skills */}

            <div className="analysis-section">

              <h2>
                💻 Skills
              </h2>

              <div className="analysis-list">

                {analysis.skills?.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="skill-tag"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>


            {/* Strengths */}

            <div className="analysis-section">

              <h2>
                💪 Strengths
              </h2>

              <ul>

                {analysis.strengths?.map(
                  (strength, index) => (
                    <li key={index}>
                      {strength}
                    </li>
                  )
                )}

              </ul>

            </div>


            {/* Weaknesses */}

            <div className="analysis-section">

              <h2>
                ⚠️ Areas to Improve
              </h2>

              <ul>

                {analysis.weaknesses?.map(
                  (weakness, index) => (
                    <li key={index}>
                      {weakness}
                    </li>
                  )
                )}

              </ul>

            </div>


            {/* Suggestions */}

            <div className="analysis-section">

              <h2>
                🚀 Suggestions
              </h2>

              <ul>

                {analysis.suggestions?.map(
                  (suggestion, index) => (
                    <li key={index}>
                      {suggestion}
                    </li>
                  )
                )}

              </ul>

            </div>


            {/* Recommended Skills */}

            <div className="analysis-section">

              <h2>
                🎯 Recommended Skills to Learn
              </h2>

              <div className="analysis-list">

                {analysis.recommendedSkills?.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="skill-tag"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>
        )}


        {/* ==============================
            EXTRACTED TEXT
        ============================== */}

        {resumeText && (
          <div className="resume-result-card">

            <h2>
              📄 Extracted Resume Text
            </h2>

            <pre>
              {resumeText}
            </pre>

          </div>
        )}

      </div>

    </div>
  );
}

export default ResumeAnalysis;