
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
  const [openingId, setOpeningId] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Load saved sessions and progress
  const loadInterviewData = useCallback(async () => {
    const token = localStorage.getItem("token");

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
      console.error("Interview data error:", err);
      setError(err.message || "Failed to load interview data");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviewData();
  }, [loadInterviewData]);

  // Generate a new interview
  const generateInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

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

      const savedAnswers = {};

      (data.interview.questions || []).forEach((question) => {
        savedAnswers[question._id] = question.answer || "";
      });

      setAnswers(savedAnswers);

      await loadInterviewData();

      document.getElementById("current-interview")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Interview generation error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Open an existing saved session
  const openInterviewSession = async (sessionId) => {
    try {
      setOpeningId(sessionId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load interview session"
        );
      }

      setInterview(data.interview);

      const savedAnswers = {};

      (data.interview.questions || []).forEach((question) => {
        savedAnswers[question._id] = question.answer || "";
      });

      setAnswers(savedAnswers);

      document.getElementById("current-interview")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Open interview session error:", err);
      setError(err.message || "Failed to open interview session");
    } finally {
      setOpeningId(null);
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

      const token = localStorage.getItem("token");
      const answer = answers[questionId] || "";

      if (!token) {
        throw new Error("Please log in again.");
      }

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
          data.message || "Failed to evaluate answer"
        );
      }

      setInterview((previousInterview) => {
        if (!previousInterview) {
          return previousInterview;
        }

        return {
          ...previousInterview,
          questions: previousInterview.questions.map((question) =>
            question._id === questionId ? data.question : question
          )
        };
      });

      // Refresh history, summary, and chart data
      await loadInterviewData();
    } catch (err) {
      console.error("Answer evaluation error:", err);
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
    return typeof score === "number" ? `${score}/10` : "Not scored";
  };

  const getStatusClass = (status) => {
    if (status === "Completed") return "interview-status-completed";
    if (status === "In progress") return "interview-status-in-progress";
    return "interview-status-not-started";
  };
  // Derive weak topics from evaluated questions in the currently open session.
  const weakTopics = (interview?.questions || [])
    .filter(
      (question) =>
        typeof question.score === "number" && question.score < 6
    )
    .map((question) => ({
      id: question._id,
      topic: question.question,
      score: question.score,
      feedback: question.feedback,
      improvements: question.improvements || []
    }));

  const evaluatedCurrentQuestions = (interview?.questions || [])
    .filter((question) => typeof question.score === "number").length;

  // Only show sessions that have at least one evaluated answer.
  const scoredSessions = (progress?.sessions || []).filter(
    (session) => typeof session.averageScore === "number"
  );

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Page header */}
        <header className="interview-header">
          <h1>AI Interview Preparation</h1>
          <p>
            Practice personalized interview questions and track your
            progress across sessions.
          </p>
        </header>

        {/* Error message */}
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
                  <strong>{progress.totalSessions ?? 0}</strong>
                </article>

                <article className="interview-stat-card">
                  <span>Answers Evaluated</span>
                  <strong>{progress.answeredQuestions ?? 0}</strong>
                  <small>
                    Out of {progress.totalQuestions ?? 0} questions
                  </small>
                </article>

                <article className="interview-stat-card">
                  <span>Overall Average</span>
                  <strong>{formatScore(progress.overallAverage)}</strong>
                </article>
              </div>

              {/* Score progress summary */}
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
                      {progress.improvement == null
                        ? "Not enough data"
                        : `${
                            progress.improvement > 0 ? "+" : ""
                          }${progress.improvement}/10`}
                    </strong>
                  </p>
                </div>

                <p className="interview-progress-note">
                  The difference compares your first and latest sessions
                  that contain evaluated answers.
                </p>
              </div>

              {/* Score history chart */}
              <div className="interview-chart-card">
                <h3>Interview Score History</h3>

                <p className="interview-chart-description">
                  Compare your average score across practice sessions.
                </p>

                {scoredSessions.length > 0 ? (
                  <div className="interview-chart">
                    {scoredSessions.map((session) => (
                      <div
                        className="interview-chart-column"
                        key={session._id}
                      >
                        <span className="interview-chart-score">
                          {session.averageScore}/10
                        </span>

                        <div className="interview-chart-bar-area">
                          <div
                            className="interview-chart-bar"
                            style={{
                              height: `${
                                Math.max(
                                  0,
                                  Math.min(session.averageScore * 10, 100)
                                )
                              }%`
                            }}
                          />
                        </div>

                        <span className="interview-chart-label">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>
                    Your score chart will appear after you complete and
                    evaluate at least one interview answer.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p>Progress information is not available yet.</p>
          )}
        </section>

        {/* Personalized recommendations */}
        <section className="interview-recommendations">
          <div className="interview-recommendations-heading">
            <div>
              <h2>Personalized Recommendations</h2>
              <p>
                Review lower-scoring answers from your currently open
                interview and identify what to improve.
              </p>
            </div>
          </div>

          {interview ? (
            <>
              <div className="interview-recommendation-summary">
                <article>
                  <span>Evaluated Answers</span>
                  <strong>{evaluatedCurrentQuestions}</strong>
                </article>

                <article>
                  <span>Topics to Improve</span>
                  <strong>{weakTopics.length}</strong>
                </article>
              </div>

              {evaluatedCurrentQuestions === 0 ? (
                <p>
                  Evaluate an interview answer to receive personalized
                  recommendations.
                </p>
              ) : weakTopics.length === 0 ? (
                <p>
                  Great work! None of your evaluated answers scored below
                  6/10. Continue practising to maintain your performance.
                </p>
              ) : (
                <div className="interview-weak-topics">
                  <h3>Focus on These Questions</h3>

                  {weakTopics.map((topic) => (
                    <article
                      className="interview-weak-topic-card"
                      key={topic.id}
                    >
                      <div className="interview-weak-topic-top">
                        <h4>{topic.topic}</h4>

                        <span className="interview-weak-topic-score">
                          {topic.score}/10
                        </span>
                      </div>

                      {topic.feedback && (
                        <div>
                          <h4>Feedback</h4>
                          <p>{topic.feedback}</p>
                        </div>
                      )}

                      {topic.improvements.length > 0 && (
                        <div>
                          <h4>How to Improve</h4>
                          <ul>
                            {topic.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p>
              Open an interview session or generate a new one to see
              personalized recommendations.
            </p>
          )}
        </section>

        {/* Generate a new interview */}
        <section className="interview-generator">
          <h2>Start a New Interview</h2>
          <p>
            Generate personalized interview questions to practise your
            technical and communication skills.
          </p>

          <button
            className="interview-primary-button"
            onClick={generateInterview}
            disabled={loading}
          >
            {loading ? "Generating Questions..." : "Generate Interview"}
          </button>
        </section>

        {/* Current interview */}
        {interview && (
          <section
            className="current-interview"
            id="current-interview"
          >
            <div className="current-interview-heading">
              <div>
                <h2>{interview.title || "Your Interview Session"}</h2>
                <p>
                  Created: {formatDate(interview.createdAt)}
                </p>
              </div>

              <span
                className={`interview-status ${getStatusClass(
                  interview.status
                )}`}
              >
                {interview.status || "In progress"}
              </span>
            </div>

            {interview.questions?.map((question, index) => (
              <article
                className="interview-question-card"
                key={question._id}
              >
                <h3>
                  Question {index + 1}: {question.question}
                </h3>

                {question.category && (
                  <p className="interview-question-category">
                    Category: {question.category}
                  </p>
                )}

                <label htmlFor={`answer-${question._id}`}>
                  Your Answer
                </label>

                <textarea
                  id={`answer-${question._id}`}
                  value={answers[question._id] || ""}
                  onChange={(event) =>
                    handleAnswerChange(
                      question._id,
                      event.target.value
                    )
                  }
                  placeholder="Write your answer here..."
                  rows={6}
                />

                <button
                  className="interview-evaluate-button"
                  onClick={() => evaluateAnswer(question._id)}
                  disabled={evaluatingId === question._id}
                >
                  {evaluatingId === question._id
                    ? "Evaluating..."
                    : "Evaluate Answer"}
                </button>

                {typeof question.score === "number" && (
                  <div className="interview-answer-feedback">
                    <h4>
                      Score: {formatScore(question.score)}
                    </h4>

                    {question.feedback && (
                      <p>{question.feedback}</p>
                    )}

                    {question.strengths?.length > 0 && (
                      <>
                        <h4>Strengths</h4>
                        <ul>
                          {question.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {question.improvements?.length > 0 && (
                      <>
                        <h4>Areas to Improve</h4>
                        <ul>
                          {question.improvements.map(
                            (improvement, index) => (
                              <li key={index}>{improvement}</li>
                            )
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {/* Previous interview sessions */}
        <section className="interview-history">
          <div className="interview-history-heading">
            <div>
              <h2>Previous Interview Sessions</h2>
              <p>
                Reopen a saved session to review answers and feedback.
              </p>
            </div>

            <button
              className="interview-refresh-button"
              onClick={loadInterviewData}
              disabled={historyLoading}
            >
              {historyLoading ? "Refreshing..." : "Refresh History"}
            </button>
          </div>

          {historyLoading ? (
            <p>Loading interview history...</p>
          ) : history.length === 0 ? (
            <p>
              No saved interview sessions yet. Generate your first
              interview to get started.
            </p>
          ) : (
            <div className="interview-history-list">
              {history.map((session) => (
                <article
                  className="interview-history-card"
                  key={session._id}
                >
                  <div className="interview-history-card-content">
                    <h3>
                      {session.title || "Interview Practice"}
                    </h3>

                    <p>
                      Created: {formatDate(session.createdAt)}
                    </p>

                    <p>
                      Status: {session.status || "In progress"}
                    </p>

                    <p>
                      Score: {formatScore(session.averageScore)}
                    </p>
                  </div>

                  <button
                    className="interview-open-button"
                    onClick={() => openInterviewSession(session._id)}
                    disabled={openingId === session._id}
                  >
                    {openingId === session._id
                      ? "Opening..."
                      : "Open Session"}
                  </button>
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