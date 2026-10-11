
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [resumeHistory, setResumeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName =
    localStorage.getItem("userName") || "User";

  const token = localStorage.getItem("token");

  // Fetch resume history
  useEffect(() => {
    const fetchResumeHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/resume/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch resume history"
          );
        }

        setResumeHistory(data.analyses || []);
      } catch (error) {
        console.error("Resume history error:", error);
        setError(error.message || "Failed to load resume history");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchResumeHistory();
    } else {
      setLoading(false);
      setError("Please log in to access your dashboard.");
    }
  }, [token]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {userName} 👋</h1>
            <p>
              Your AI-powered career preparation dashboard.
            </p>
          </div>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* Feature cards */}
        <div className="dashboard-features">

          {/* Resume Analysis */}
          <div className="feature-card">
            <h2>Resume Analysis</h2>
            <p>
              Upload your resume and get an AI-powered analysis
              with strengths, weaknesses and improvement suggestions.
            </p>
            <button
              onClick={() => navigate("/resume-analysis")}
            >
              Analyze Resume
            </button>
          </div>

          {/* Job Matching */}
          <div className="feature-card">
            <h2>Job Matching</h2>
            <p>
              Compare your resume against a job description
              and discover your skill gaps.
            </p>
            <button
              onClick={() => navigate("/job-matching")}
            >
              Find Jobs
            </button>
          </div>

          {/* Career Roadmap */}
          <div className="feature-card">
            <h2>AI Career Roadmap</h2>
            <p>
              Generate a personalized learning roadmap based on
              your resume and job skill gaps.
            </p>
            <button
              onClick={() => navigate("/career-roadmap")}
            >
              Build Roadmap
            </button>
          </div>

          {/* Skill Development */}
          <div className="feature-card">
            <h2>Skill Development</h2>
            <p>
              Identify the technical skills you should focus on
              to improve your career readiness.
            </p>
            <button
              onClick={() => navigate("/career-roadmap")}
            >
              View Skills
            </button>
          </div>

          {/* Interview Preparation */}
          <div className="feature-card">
            <h2>Interview Preparation</h2>
            <p>
              Practice technical and behavioral interview questions
              based on your profile.
            </p>
            <button
              onClick={() => navigate("/interview-preparation")}
            >
              Practice Interview
            </button>
          </div>

          {/* Career Insights */}
          <div className="feature-card">
            <h2>Career Insights</h2>
            <p>
              Track your resume scores, job matches, frequently
              identified skills and career preparation progress.
            </p>
            <button
              onClick={() => navigate("/career-insights")}
            >
              View Career Insights
            </button>
          </div>

        </div>

        {/* Resume history */}
        <div className="dashboard-history">
          <div className="history-header">
            <h2>Resume Analysis History</h2>

            <button
              onClick={() => navigate("/resume-analysis")}
            >
              Analyze New Resume
            </button>
          </div>

          {loading ? (
            <p>Loading history...</p>
          ) : resumeHistory.length === 0 ? (
            <div className="empty-history">
              <h3>No Resume Analysis Yet</h3>
              <p>
                Upload your resume to start your career analysis.
              </p>
              <button
                onClick={() => navigate("/resume-analysis")}
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="history-list">
              {resumeHistory.map((item) => (
                <div
                  className="history-card"
                  key={item._id}
                >
                  <div>
                    <h3>{item.fileName}</h3>

                    <p>
                      Score:{" "}
                      <strong>{item.score}/100</strong>
                    </p>

                    <p>{item.summary}</p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/resume-analysis/${item._id}`)
                    }
                  >
                    View Analysis →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
