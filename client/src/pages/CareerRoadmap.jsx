import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CareerRoadmap.css";

function CareerRoadmap() {
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");


  // ==========================================
  // GET ROADMAP HISTORY
  // ==========================================

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/roadmap/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch roadmap history"
          );
        }

        setHistory(data.roadmaps || []);

        if (data.roadmaps?.length > 0) {
          setRoadmap(data.roadmaps[0]);
        }

      } catch (error) {
        console.error(error);

        setError(error.message);

      } finally {
        setHistoryLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    } else {
      setHistoryLoading(false);
    }
  }, [token]);


  // ==========================================
  // GENERATE ROADMAP
  // ==========================================

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/roadmap/generate",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate roadmap"
        );
      }

      setRoadmap(data.roadmap);

      setHistory((previous) => [
        data.roadmap,
        ...previous
      ]);

    } catch (error) {
      console.error(error);

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (historyLoading) {
    return (
      <div className="roadmap-page">
        <div className="roadmap-container">
          <p>Loading roadmap...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="roadmap-page">

      <div className="roadmap-container">

        {/* HEADER */}

        <div className="roadmap-header">

          <div>
            <h1>
              AI Career Roadmap
            </h1>

            <p>
              Get a personalized learning
              plan based on your resume
              and job skill gaps.
            </p>
          </div>

          <button
            className="generate-roadmap-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate My Roadmap"}
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="roadmap-error">
            {error}
          </div>
        )}


        {/* NO ROADMAP */}

        {!roadmap && !loading && (
          <div className="roadmap-empty">

            <h2>
              Build Your Career Roadmap
            </h2>

            <p>
              Upload your resume and analyze
              a job to generate a personalized
              roadmap.
            </p>

            <button
              onClick={() =>
                navigate("/resume-analysis")
              }
            >
              Analyze Resume
            </button>

          </div>
        )}


        {/* ROADMAP */}

        {roadmap && (
          <>

            {/* SUMMARY */}

            <section className="roadmap-summary">

              <div>

                <span className="roadmap-label">
                  Career Goal
                </span>

                <h2>
                  {roadmap.goal}
                </h2>

              </div>


              <div>

                <span className="roadmap-label">
                  Duration
                </span>

                <h2>
                  {roadmap.totalWeeks} Weeks
                </h2>

              </div>

            </section>


            <section className="roadmap-introduction">

              <h2>
                {roadmap.title}
              </h2>

              <p>
                {roadmap.summary}
              </p>

            </section>


            {/* WEEKS */}

            <section className="roadmap-weeks">

              {roadmap.weeks?.map(
                (week) => (

                  <div
                    className="roadmap-week"
                    key={week.week}
                  >

                    <div className="week-number">
                      Week {week.week}
                    </div>


                    <h2>
                      {week.title}
                    </h2>


                    <p className="week-objective">
                      {week.objective}
                    </p>


                    {/* SKILLS */}

                    <div className="roadmap-section">

                      <h3>
                        Skills
                      </h3>

                      <div className="skill-list">

                        {week.skills?.map(
                          (skill, index) => (
                            <span
                              className="skill-badge"
                              key={index}
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                    </div>


                    {/* TOPICS */}

                    <div className="roadmap-section">

                      <h3>
                        Topics
                      </h3>

                      <ul>

                        {week.topics?.map(
                          (topic, index) => (
                            <li key={index}>
                              {topic}
                            </li>
                          )
                        )}

                      </ul>

                    </div>


                    {/* TASKS */}

                    <div className="roadmap-section">

                      <h3>
                        Tasks
                      </h3>

                      <ul>

                        {week.tasks?.map(
                          (task, index) => (
                            <li key={index}>
                              <span className="task-box">
                                ☐
                              </span>

                              {task}
                            </li>
                          )
                        )}

                      </ul>

                    </div>


                    {/* PROJECT */}

                    <div className="roadmap-project">

                      <h3>
                        Project
                      </h3>

                      <p>
                        {week.project}
                      </p>

                    </div>

                  </div>

                )
              )}

            </section>


            {/* HISTORY */}

            {history.length > 0 && (

              <section className="roadmap-history">

                <h2>
                  Previous Roadmaps
                </h2>

                {history.map(
                  (item) => (

                    <div
                      className="roadmap-history-card"
                      key={item._id}
                    >

                      <div>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.totalWeeks} weeks
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/career-roadmap/${item._id}`
                          )
                        }
                      >
                        View →
                      </button>

                    </div>

                  )
                )}

              </section>

            )}

          </>
        )}

      </div>

    </div>
  );
}

export default CareerRoadmap;