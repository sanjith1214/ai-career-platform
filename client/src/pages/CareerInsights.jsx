
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./CareerInsights.css";

function CareerInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in to view your insights.");
        }

        const response = await fetch(
          "http://localhost:5000/api/insights",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load career insights."
          );
        }

        setInsights(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <main className="insights-page">
        <p className="insights-status">Loading your career insights...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="insights-page">
        <p className="insights-error">{error}</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </main>
    );
  }

  const stats = insights.stats;

  return (
    <main className="insights-page">
      <div className="insights-container">
        <header className="insights-header">
          <p className="insights-eyebrow">YOUR CAREER OVERVIEW</p>
          <h1>Career Insights</h1>
          <p>
            Understand your progress, identify skill gaps, and plan your
            next career move using your existing analysis results.
          </p>
        </header>

        <section className="insights-stats">
          <article className="insights-stat-card">
            <span>Resume Analyses</span>
            <strong>{stats.resumeAnalyses}</strong>
          </article>

          <article className="insights-stat-card">
            <span>Job Matches</span>
            <strong>{stats.jobMatches}</strong>
          </article>

          <article className="insights-stat-card">
            <span>Career Roadmaps</span>
            <strong>{stats.careerRoadmaps}</strong>
          </article>
        </section>

        <section className="insights-score-grid">
          <article className="insights-panel">
            <h2>Latest Resume Score</h2>

            {insights.latestResume ? (
              <>
                <div className="insights-score">
                  {insights.latestResume.score ?? 0}
                  <span>/100</span>
                </div>

                <p className="insights-muted">
                  {insights.latestResume.fileName}
                </p>

                <Link to="/resume-analysis">
                  View Resume Analysis
                </Link>
              </>
            ) : (
              <>
                <p>No resume analysis found yet.</p>
                <Link to="/resume-analysis">Analyze Your Resume</Link>
              </>
            )}
          </article>

          <article className="insights-panel">
            <h2>Latest Job Match</h2>

            {insights.latestJobMatch ? (
              <>
                <div className="insights-score">
                  {insights.latestJobMatch.score ?? 0}
                  <span>/100</span>
                </div>

                <p className="insights-muted">
                  Your latest job compatibility score
                </p>

                <Link to="/job-matching">
                  View Job Matching
                </Link>
              </>
            ) : (
              <>
                <p>No job-match analysis found yet.</p>
                <Link to="/job-matching">Analyze a Job</Link>
              </>
            )}
          </article>
        </section>

        <section className="insights-panel">
          <h2>Frequently Identified Skills</h2>
          <p className="insights-muted">
            Skills appearing across your ten most recent resume analyses.
          </p>

          {insights.topSkills.length ? (
            <div className="insights-tags">
              {insights.topSkills.map((skill) => (
                <span className="insights-tag" key={skill.name}>
                  {skill.name}
                  <small>{skill.count}</small>
                </span>
              ))}
            </div>
          ) : (
            <p>No skills found. Analyze your resume first.</p>
          )}
        </section>

        <section className="insights-panel">
          <h2>Priority Skills to Develop</h2>
          <p className="insights-muted">
            Skills most frequently listed as missing in your ten most recent
            job-match analyses.
          </p>

          {insights.prioritySkills.length ? (
            <div className="insights-tags">
              {insights.prioritySkills.map((skill) => (
                <span
                  className="insights-tag insights-tag-priority"
                  key={skill.name}
                >
                  {skill.name}
                  <small>{skill.count}</small>
                </span>
              ))}
            </div>
          ) : (
            <p>
              No missing skills recorded yet. Run a job-match analysis to
              discover skill gaps.
            </p>
          )}
        </section>

        <section className="insights-panel">
          <h2>Recommended Next Steps</h2>

          {insights.recommendations.length ? (
            <ul className="insights-recommendations">
              {insights.recommendations.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              Complete more analyses to receive personalized next steps.
            </p>
          )}
        </section>

        <nav className="insights-actions">
          <Link to="/resume-analysis">Resume Analysis</Link>
          <Link to="/job-matching">Job Matching</Link>
          <Link to="/career-roadmap">Career Roadmap</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </main>
  );
}

export default CareerInsights;
