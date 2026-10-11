
import { useCallback, useEffect, useState } from "react";

import "./InterviewPreparation.css";

const API_URL = "http://localhost:5000/api/interview";

function InterviewPreparation() {
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});
  const [evaluatingId, setEvaluatingId] = useState(null);

  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Load history and progress
  const loadInterviewData = useCallback(async () => {
    if (!token) {
      setError("Please log in to access interview preparation.");
      setHistoryLoading(false);
      return;
    }

    try {
      setHistoryLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [historyResponse, progressResponse] =
        await Promise.all([
          fetch(`${API_URL}/history`, { headers }),
          fetch(`${API_URL}/progress`, { headers })
        ]);

      const historyData = await historyResponse.json();
      const progressData = await progressResponse.json();

      if (!historyResponse.ok) {
        throw new Error(
          historyData.message || "Failed to load interview history"
        );
      }

      if (!progressResponse.ok) {
        throw new Error(
          progressData.message || "Failed to load interview progress"
        );
      }

      setHistory(historyData.interviews || []);
      setProgress(progressData);
    } catch (err) {
      console.error("Interview history error:", err);
      setError(err.message || "Failed to load interview data");
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInterviewData();
  }, [loadInterviewData]);

  // Generate interview questions
  const generateInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate interview"
        );
      }

      setInterview(data.interview);
      setAnswers({});

      await loadInterviewData();
    } catch (err) {
      console.error("Interview generation error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Update an answer
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: answer
    }));
  };

  // Evaluate an answer
  const evaluateAnswer = async (questionId) => {
    try {
      setEvaluatingId(questionId);
      setError("");

      const answer = answers[questionId] || "";

      if (!answer.trim()) {
        throw new Error("Please write an answer first.");
      }

      const response = await fetch(
        `${API_URL}/${interview._id}/question/${questionId}/evaluate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answer: answer.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit answer"
        );
      }

      setInterview((previousInterview) => {
        if (!previousInterview) {
          return previousInterview;
        }

        return {
          ...previousInterview,
          questions: previousInterview.questions.map(
            (question) =>
              question._id === questionId
                ? data.question
                : question
          )
        };
      });

      await loadInterviewData();
    } catch (err) {
      console.error("Answer submission error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setEvaluatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString();
  };

  const formatScore = (score) => {
    return typeof score === "number"
      ? `${score}/10`
      : "Not scored";
  };

  return (
    <div className="interview-page">
      <div className="interview-container">

        {/* Header */}
        <header className="interview-header">
          <h1>AI Interview Preparation</h1>
          <p>
            Practice personalized interview questions and track your
            progress across sessions.
          </p>
        </header>

        {/* Error */}
        {error && (
          <p className="interview-error" role="alert">
            {error}
          </p>
        )}

        {/* Progress summary */}
        <section className="interview-progress">
          <div className="interview-progress-heading">
            <div>
              <h2>Your Interview Progress</h2>
              <p>Statistics from your saved interview sessions.</p>
            </div>

            <button
              className="interview-refresh-button"
              onClick={loadInterviewData}
              disabled={historyLoading}
            >
              {historyLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {historyLoading ? (
            <p>Loading progress...</p>
          ) : progress ? (
            <>
              <div className="interview-stat-grid">
                <article className="interview-stat-card">
                  <span>Total Sessions</span>
                  <strong>{progress.totalSessions}</strong>
                </article>

                <article className="interview-stat-card">
                  <span>Answers Evaluated</span>
                  <strong>{progress.answeredQuestions}</strong>
                  <small>
                    Out of {progress.totalQuestions} questions
                  </small>
                </article>

                <article className="interview-stat-card">
                  <span>Overall Average</span>
                  <strong>{formatScore(progress.overallAverage)}</strong>
                </article>
              </div>

              <div className="interview-trend-card">
                <h3>Score Progress</h3>

                <div className="interview-trend-values">
                  <p>
                    <span>First scored session</span>
                    <strong>{formatScore(progress.firstAverage)}</strong>
                  </p>

                  <p>
                    <span>Latest scored session</span>
                    <strong>{formatScore(progress.latestAverage)}</strong>
                  </p>

                  <p>
                    <span>Score difference</span>
                    <strong>
                      {progress.improvement === null
                        ? "Not enough data"
                        : `${progress.improvement > 0 ? "+" : ""}${progress.improvement}/10`}
                    </strong>
                  </p>
                </div>

                <p className="interview-progress-note">
                  The difference compares your first and latest sessions
                  that have evaluated answers.
                </p>
              </div>
            </>
          ) : (
            <p>Progress data is unavailable.</p>
          )}
        </section>

        {/* Generate interview */}
        <section className="interview-generate-section">
          <h2>Start a Practice Session</h2>
          <p>
            Generate personalized questions from your resume and latest
            job-match analysis.
          </p>

          <button
            className="generate-interview-button"
            disabled={loading}
            onClick={generateInterview}
          >
            {loading
              ? "Generating..."
              : "Generate Interview Questions"}
          </button>
        </section>

        {/* Current interview */}
        {interview && (
          <section className="interview-questions">
            <h2>Interview Questions</h2>

            {interview.questions.map((item, index) => (
              <article
                className="interview-question-card"
                key={item._id || index}
              >
                <h3>Question {index + 1}</h3>

                <p className="interview-question">
                  {item.question}
                </p>

                <div className="interview-meta">
                  <span className="interview-badge">
                    Type: {item.type}
                  </span>

                  <span className="interview-badge">
                    Difficulty: {item.difficulty}
                  </span>
                </div>

                <textarea
                  className="interview-answer"
                  placeholder="Write your answer here..."
                  value={answers[item._id] ?? item.answer ?? ""}
                  onChange={(event) =>
                    handleAnswerChange(
                      item._id,
                      event.target.value
                    )
                  }
                />

                <button
                  className="evaluate-answer-button"
                  disabled={evaluatingId === item._id}
                  onClick={() => evaluateAnswer(item._id)}
                >
                  {evaluatingId === item._id
                    ? "Evaluating..."
                    : "Evaluate Answer"}
                </button>

                {typeof item.score === "number" && (
                  <div className="interview-evaluation">
                    <h3>AI Evaluation</h3>

                    <div className="interview-score">
                      <strong>Score:</strong>
                      <span>{item.score}/10</span>
                    </div>

                    {item.feedback && (
                      <div className="interview-feedback">
                        <strong>Feedback</strong>
                        <p>{item.feedback}</p>
                      </div>
                    )}

                    {item.strengths?.length > 0 && (
                      <div className="interview-strengths">
                        <strong>Strengths</strong>
                        <ul>
                          {item.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.improvements?.length > 0 && (
                      <div className="interview-improvements">
                        <strong>Improvements</strong>
                        <ul>
                          {item.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {/* Interview history */}
        <section className="interview-history">
          <div className="interview-history-heading">
            <div>
              <h2>Previous Interview Sessions</h2>
              <p>Review your saved sessions and scores.</p>
            </div>
          </div>

          {historyLoading ? (
            <p>Loading interview history...</p>
          ) : history.length === 0 ? (
            <div className="interview-history-empty">
              <h3>No Interview Sessions Yet</h3>
              <p>
                Generate your first interview to start tracking your
                preparation.
              </p>
            </div>
          ) : (
            <div className="interview-history-list">
              {history.map((session, index) => (
                <article
                  className="interview-history-card"
                  key={session._id}
                >
                  <div className="interview-history-card-top">
                    <div>
                      <h3>
                        Interview Session #{history.length - index}
                      </h3>
                      <p>{formatDate(session.createdAt)}</p>
                    </div>

                    <span
                      className={`interview-status interview-status-${session.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="interview-history-stats">
                    <p>
                      <span>Questions</span>
                      <strong>{session.totalQuestions}</strong>
                    </p>

                    <p>
                      <span>Evaluated</span>
                      <strong>{session.answeredQuestions}</strong>
                    </p>

                    <p>
                      <span>Average Score</span>
                      <strong>{formatScore(session.averageScore)}</strong>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default InterviewPreparation;
