import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function JobMatching() {

  const navigate = useNavigate();


  // =====================================================
  // Job Description
  // =====================================================

  const [jobDescription, setJobDescription] =
    useState("");


  // =====================================================
  // Current Match
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [match, setMatch] =
    useState(null);


  // =====================================================
  // Job Match History
  // =====================================================

  const [history, setHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(true);


  // =====================================================
  // Fetch History
  // =====================================================

  useEffect(() => {

    const fetchHistory = async () => {

      try {

        const token =
          localStorage.getItem("token");


        if (!token) {

          setHistoryLoading(false);

          return;
        }


        const response =
          await fetch(
            "http://localhost:5000/api/job/history",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch job history"
          );
        }


        console.log(
          "Job match history:",
          data
        );


        setHistory(
          data.matches || []
        );

      } catch (error) {

        console.error(
          "Job history error:",
          error
        );

        setMessage(
          error.message
        );

      } finally {

        setHistoryLoading(false);
      }
    };


    fetchHistory();

  }, []);


  // =====================================================
  // Analyze Job
  // =====================================================

  const handleAnalyze = async () => {

    // Check empty description
    if (!jobDescription.trim()) {

      setMessage(
        "Please enter a job description"
      );

      return;
    }


    try {

      setLoading(true);

      setMessage("");

      setMatch(null);


      // Get token
      const token =
        localStorage.getItem("token");


      if (!token) {

        setMessage(
          "Please login again"
        );

        return;
      }


      // Send job description
      const response =
        await fetch(
          "http://localhost:5000/api/job/match",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              jobDescription
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Job matching failed"
        );
      }


      console.log(
        "Job matching response:",
        data
      );


      // Store current result
      setMatch(
        data.match
      );


      setMessage(
        "Job matching completed successfully!"
      );


      // Add new match to history
      if (data.match) {

        setHistory(
          (previousHistory) => [
            data.match,
            ...previousHistory
          ]
        );
      }

    } catch (error) {

      console.error(
        "Job matching error:",
        error
      );

      setMessage(
        error.message
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="job-matching-page">

      <div className="job-matching-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="job-matching-header">

          <p className="job-matching-label">
            AI JOB MATCHING
          </p>

          <h1>
            Match Your Resume With a Job
          </h1>

          <p>
            Compare your resume with a
            company's job description and
            discover your compatibility.
          </p>

        </div>


        {/* =================================================
            INPUT CARD
        ================================================= */}

        <div className="job-matching-card">

          <div className="job-matching-icon">
            💼
          </div>

          <h2>
            Enter Job Description
          </h2>

          <p>
            Paste the job description below.
            Our AI will compare it with your
            resume.
          </p>


          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
            placeholder={`Example:

Software Developer Intern

Requirements:
• Java
• Data Structures and Algorithms
• React
• Node.js
• MongoDB
• REST APIs
• Git`}
          />


          <div className="job-matching-footer">

            <span>
              {jobDescription.length} characters
            </span>


            <button
              onClick={handleAnalyze}
              disabled={
                loading ||
                !jobDescription.trim()
              }
            >
              {loading
                ? "Analyzing..."
                : "Analyze Job Match →"}
            </button>

          </div>


          {message && (

            <p className="job-matching-message">
              {message}
            </p>

          )}

        </div>


        {/* =================================================
            CURRENT RESULT
        ================================================= */}

        {match && (

          <div className="job-match-result">

            <div className="result-header">

              <p className="job-matching-label">
                AI ANALYSIS RESULT
              </p>

              <h2>
                Your Job Match
              </h2>

            </div>


            {/* Score */}

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


            {/* Matched Skills */}

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


            {/* Missing Skills */}

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


            {/* Strengths */}

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


            {/* Suggestions */}

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

          </div>

        )}


        {/* =================================================
            JOB MATCH HISTORY
        ================================================= */}

        <div className="job-history">

          <div className="job-history-header">

            <p className="job-matching-label">
              YOUR HISTORY
            </p>

            <h2>
              Previous Job Matches
            </h2>

            <p>
              Review your previous AI-powered
              job compatibility analyses.
            </p>

          </div>


          {/* Loading */}

          {historyLoading ? (

            <div className="job-history-empty">

              Loading your job matches...

            </div>


          ) : history.length === 0 ? (

            /* No history */

            <div className="job-history-empty">

              <h3>
                No job matches yet
              </h3>

              <p>
                Analyze your first job
                description to see it here.
              </p>

            </div>


          ) : (

            /* History List */

            <div className="job-history-list">

              {history.map(
                (item, index) => (

                  <div
                    className="job-history-card"
                    key={
                      item._id || index
                    }
                  >


                    {/* Card Header */}

                    <div className="job-history-card-top">

                      <div>

                        <h3>
                          Job Match #
                          {history.length - index}
                        </h3>

                        <p>
                          {item.resumeAnalysis
                            ?.fileName ||
                            "Resume"}
                        </p>

                      </div>


                      <div className="job-history-score">

                        {item.score}

                        <span>
                          /100
                        </span>

                      </div>

                    </div>


                    {/* Description */}

                    <div className="job-history-description">

                      <strong>
                        Job Description
                      </strong>

                      <p>
                        {item.jobDescription}
                      </p>

                    </div>


                    {/* Skills */}

                    <div className="job-history-skills">


                      {/* Matched */}

                      <div>

                        <strong>
                          Matched Skills
                        </strong>

                        <div className="skill-list">

                          {item.matchedSkills
                            ?.slice(0, 5)
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="skill-badge matched"
                                  key={skillIndex}
                                >
                                  {skill}
                                </span>

                              )
                            )}

                        </div>

                      </div>


                      {/* Missing */}

                      <div>

                        <strong>
                          Missing Skills
                        </strong>

                        <div className="skill-list">

                          {item.missingSkills
                            ?.slice(0, 5)
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="skill-badge missing"
                                  key={skillIndex}
                                >
                                  {skill}
                                </span>

                              )
                            )}

                        </div>

                      </div>

                    </div>


                    {/* View Details */}

                    <button
                      onClick={() =>
                        navigate(
                          `/job-matching/${item._id}`
                        )
                      }
                    >
                      View Full Analysis →
                    </button>


                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <div className="job-matching-info">


          <div className="job-info-card">

            <span>
              🎯
            </span>

            <h3>
              Match Score
            </h3>

            <p>
              See how closely your resume
              matches the job requirements.
            </p>

          </div>


          <div className="job-info-card">

            <span>
              🔍
            </span>

            <h3>
              Skill Gap
            </h3>

            <p>
              Identify important skills
              missing from your resume.
            </p>

          </div>


          <div className="job-info-card">

            <span>
              🚀
            </span>

            <h3>
              Improve Your Resume
            </h3>

            <p>
              Get AI-powered suggestions
              to improve your chances of
              matching the role.
            </p>

          </div>


        </div>


      </div>

    </div>
  );
}


export default JobMatching;