import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResumeAnalysisDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/resume/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load analysis"
          );
        }

        setAnalysis(data.analysis);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="resume-page">
        <div className="resume-container">
          <h2>Loading Analysis...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-page">
        <div className="resume-container">
          <h2>Unable to Load Analysis</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-page">
      <div className="resume-container">

        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="resume-header">
          <p className="resume-label">
            AI RESUME ANALYZER
          </p>

          <h1>Resume Analysis</h1>

          <p>
            Detailed AI-powered analysis of your resume.
          </p>
        </div>

        <div className="resume-result-card">

          <h2>{analysis.fileName}</h2>

          <p>
            Analyzed on{" "}
            {new Date(analysis.createdAt).toLocaleDateString()}
          </p>

          <h2>
            Resume Score: {analysis.score}/100
          </h2>

          <h3>Summary</h3>
          <p>{analysis.summary}</p>

          <h3>Skills</h3>
          {analysis.skills?.length > 0 ? (
            <ul>
              {analysis.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p>No skills identified.</p>
          )}

          <h3>Strengths</h3>
          {analysis.strengths?.length > 0 ? (
            <ul>
              {analysis.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No strengths identified.</p>
          )}

          <h3>Weaknesses</h3>
          {analysis.weaknesses?.length > 0 ? (
            <ul>
              {analysis.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No weaknesses identified.</p>
          )}

          <h3>Suggestions</h3>
          {analysis.suggestions?.length > 0 ? (
            <ul>
              {analysis.suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No suggestions available.</p>
          )}

          <h3>Recommended Skills</h3>
          {analysis.recommendedSkills?.length > 0 ? (
            <ul>
              {analysis.recommendedSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p>No recommended skills available.</p>
          )}

        </div>

      </div>
    </div>
  );
}

export default ResumeAnalysisDetails;