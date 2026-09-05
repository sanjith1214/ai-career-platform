import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";


function JobMatchDetails() {

  // Get the ID from the URL
  const { id } = useParams();

  // Used for page navigation
  const navigate = useNavigate();

  // Stores the job match
  const [match, setMatch] =
    useState(null);

  // Loading state
  const [loading, setLoading] =
    useState(true);

  // Error message
  const [error, setError] =
    useState("");


  // =====================================================
  // Fetch Job Match
  // =====================================================

  useEffect(() => {

    const fetchJobMatch = async () => {

      try {

        // Get JWT token
        const token =
          localStorage.getItem("token");

        // Check login
        if (!token) {

          setError(
            "Please login again"
          );

          setLoading(false);

          return;
        }


        // Call backend
        const response =
          await fetch(
            `http://localhost:5000/api/job/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        // Convert response to JSON
        const data =
          await response.json();


        // Check API response
        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch job match"
          );
        }


        console.log(
          "Job match details:",
          data
        );


        // Store result
        setMatch(data.match);

      } catch (error) {

        console.error(
          "Job match details error:",
          error
        );

        setError(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };


    fetchJobMatch();

  }, [id]);


  // =====================================================
  // Loading Screen
  // =====================================================

  if (loading) {

    return (
      <div className="job-matching-page">

        <div className="job-matching-container">

          <div className="job-history-empty">

            <h3>
              Loading Job Match...
            </h3>

            <p>
              Please wait while we
              fetch your analysis.
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // Error Screen
  // =====================================================

  if (error) {

    return (
      <div className="job-matching-page">

        <div className="job-matching-container">

          <div className="job-history-empty">

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/job-matching")
              }
            >
              ← Back to Job Matching
            </button>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // Match Not Found
  // =====================================================

  if (!match) {

    return (
      <div className="job-matching-page">

        <div className="job-matching-container">

          <div className="job-history-empty">

            <h3>
              Job Match Not Found
            </h3>

            <button
              onClick={() =>
                navigate("/job-matching")
              }
            >
              ← Back to Job Matching
            </button>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // Main Page
  // =====================================================

  return (
    <div className="job-matching-page">

      <div className="job-matching-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="job-matching-header">

          <p className="job-matching-label">
            AI JOB MATCH DETAILS
          </p>

          <h1>
            Your Job Match Analysis
          </h1>

          <p>
            Detailed AI analysis of how
            your resume matches this job.
          </p>

        </div>


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          className="back-button"
          onClick={() =>
            navigate("/job-matching")
          }
        >
          ← Back to Job Matching
        </button>


        {/* =================================================
            RESULT
        ================================================= */}

        <div className="job-match-result">


          {/* =================================================
              RESUME
          ================================================= */}

          <div className="result-header">

            <p className="job-matching-label">
              RESUME USED
            </p>

            <h2>
              {match.resumeAnalysis
                ?.fileName ||
                "Resume"}
            </h2>

          </div>


          {/* =================================================
              SCORE
          ================================================= */}

          <div className="match-score-card">

            <div className="score-circle">

              <span>
                {match.score}
              </span>

              <small>
                /100
              </small>

            </div>


            <div>

              <h3>
                Match Score
              </h3>

              <p>
                How closely your resume
                matches this job description.
              </p>

            </div>

          </div>


          {/* =================================================
              MATCHED SKILLS
          ================================================= */}

          <div className="result-section">

            <h3>
              ✅ Matched Skills
            </h3>

            <div className="skill-list">

              {match.matchedSkills &&
              match.matchedSkills.length > 0 ? (

                match.matchedSkills.map(
                  (skill, index) => (

                    <span
                      className="skill-badge matched"
                      key={index}
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <p>
                  No matched skills found.
                </p>

              )}

            </div>

          </div>


          {/* =================================================
              MISSING SKILLS
          ================================================= */}

          <div className="result-section">

            <h3>
              ⚠️ Missing Skills
            </h3>

            <div className="skill-list">

              {match.missingSkills &&
              match.missingSkills.length > 0 ? (

                match.missingSkills.map(
                  (skill, index) => (

                    <span
                      className="skill-badge missing"
                      key={index}
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <p>
                  No major missing skills
                  identified.
                </p>

              )}

            </div>

          </div>


          {/* =================================================
              STRENGTHS
          ================================================= */}

          <div className="result-section">

            <h3>
              💪 Your Strengths
            </h3>

            {match.strengths &&
            match.strengths.length > 0 ? (

              <ul>

                {match.strengths.map(
                  (strength, index) => (

                    <li key={index}>
                      {strength}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No strengths identified.
              </p>

            )}

          </div>


          {/* =================================================
              SUGGESTIONS
          ================================================= */}

          <div className="result-section">

            <h3>
              🚀 Suggestions
            </h3>

            {match.suggestions &&
            match.suggestions.length > 0 ? (

              <ul>

                {match.suggestions.map(
                  (suggestion, index) => (

                    <li key={index}>
                      {suggestion}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No suggestions available.
              </p>

            )}

          </div>


          {/* =================================================
              JOB DESCRIPTION
          ================================================= */}

          <div className="result-section">

            <h3>
              💼 Job Description
            </h3>

            <div className="job-description-details">

              <p>
                {match.jobDescription}
              </p>

            </div>

          </div>


        </div>


        {/* =================================================
            BOTTOM BUTTON
        ================================================= */}

        <div className="job-details-actions">

          <button
            onClick={() =>
              navigate("/job-matching")
            }
          >
            ← Analyze Another Job
          </button>

        </div>


      </div>

    </div>
  );
}


export default JobMatchDetails;