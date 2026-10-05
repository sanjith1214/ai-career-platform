import { useState } from "react";

import "./InterviewPreparation.css";


function InterviewPreparation() {

  const [loading, setLoading] = useState(false);

  const [interview, setInterview] = useState(null);

  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});

  const [evaluatingId, setEvaluatingId] = useState(null);


  // Generate interview

  const generateInterview = async () => {

    try {

      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");


      const response =
        await fetch(
          "http://localhost:5000/api/interview/generate",
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to generate interview"
        );

      }


      setInterview(
        data.interview
      );


      setAnswers({});


    } catch (error) {

      console.error(
        "Interview generation error:",
        error
      );


      setError(
        error.message ||
          "Something went wrong"
      );


    } finally {

      setLoading(false);

    }

  };


  // Handle answer

  const handleAnswerChange = (
    questionId,
    answer
  ) => {

    setAnswers({

      ...answers,

      [questionId]:
        answer

    });

  };


  // Evaluate answer

  const evaluateAnswer = async (
    questionId
  ) => {

    try {

      setEvaluatingId(
        questionId
      );

      setError("");


      const token =
        localStorage.getItem("token");


      const answer =
        answers[questionId] || "";


      if (!answer.trim()) {

        throw new Error(
          "Please write an answer first."
        );

      }


      const response =
        await fetch(
          `http://localhost:5000/api/interview/${interview._id}/question/${questionId}/evaluate`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              answer: answer
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to submit answer"
        );

      }


      // Update evaluated question

      setInterview((previousInterview) => {

        if (!previousInterview) {
          return previousInterview;
        }


        return {

          ...previousInterview,

          questions:
            previousInterview.questions.map(
              (question) =>
                question._id === questionId
                  ? data.question
                  : question
            )

        };

      });


    } catch (error) {

      console.error(
        "Answer submission error:",
        error
      );


      setError(
        error.message ||
          "Something went wrong"
      );


    } finally {

      setEvaluatingId(null);

    }

  };


  return (

    <div className="interview-page">

      <div className="interview-container">


        {/* Header */}

        <div className="interview-header">

          <h1>
            AI Interview Preparation
          </h1>

          <p>
            Generate personalized interview questions
            based on your resume and target job.
          </p>

        </div>


        {/* Generate button */}

        <button
          className="generate-interview-button"
          disabled={loading}
          onClick={generateInterview}
        >

          {loading
            ? "Generating..."
            : "Generate Interview Questions"}

        </button>


        {/* Error */}

        {error && (

          <p className="interview-error">

            {error}

          </p>

        )}


        {/* Questions */}

        {interview && (

          <div className="interview-questions">

            <h2>
              Interview Questions
            </h2>


            {interview.questions.map(
              (item, index) => (

                <div
                  className="interview-question-card"
                  key={item._id || index}
                >

                  {/* Question number */}

                  <h3>
                    Question {index + 1}
                  </h3>


                  {/* Question */}

                  <p className="interview-question">

                    {item.question}

                  </p>


                  {/* Answer */}

                  <textarea
                    className="interview-answer"
                    placeholder="Write your answer here..."
                    value={
                      answers[item._id] || ""
                    }
                    onChange={(event) => {

                      handleAnswerChange(
                        item._id,
                        event.target.value
                      );

                    }}
                  />


                  {/* Evaluate button */}

                  <button
                    className="evaluate-answer-button"
                    disabled={
                      evaluatingId === item._id
                    }
                    onClick={() => {

                      evaluateAnswer(
                        item._id
                      );

                    }}
                  >

                    {evaluatingId === item._id
                      ? "Evaluating..."
                      : "Evaluate Answer"}

                  </button>


                  {/* Question information */}

                  <div className="interview-meta">

                    <span className="interview-badge">

                      Type: {item.type}

                    </span>


                    <span className="interview-badge">

                      Difficulty: {item.difficulty}

                    </span>

                  </div>


                  {/* AI evaluation */}

                  {item.score !== null &&
                    item.score !== undefined && (

                    <div className="interview-evaluation">

                      <h3>
                        AI Evaluation
                      </h3>


                      {/* Score */}

                      <div className="interview-score">

                        <strong>
                          Score:
                        </strong>

                        <span>
                          {item.score}/10
                        </span>

                      </div>


                      {/* Feedback */}

                      {item.feedback && (

                        <div className="interview-feedback">

                          <strong>
                            Feedback
                          </strong>

                          <p>
                            {item.feedback}
                          </p>

                        </div>

                      )}


                      {/* Strengths */}

                      {item.strengths &&
                        item.strengths.length > 0 && (

                        <div className="interview-strengths">

                          <strong>
                            Strengths
                          </strong>

                          <ul>

                            {item.strengths.map(
                              (strength, strengthIndex) => (

                                <li
                                  key={strengthIndex}
                                >
                                  {strength}
                                </li>

                              )
                            )}

                          </ul>

                        </div>

                      )}


                      {/* Improvements */}

                      {item.improvements &&
                        item.improvements.length > 0 && (

                        <div className="interview-improvements">

                          <strong>
                            Improvements
                          </strong>

                          <ul>

                            {item.improvements.map(
                              (
                                improvement,
                                improvementIndex
                              ) => (

                                <li
                                  key={improvementIndex}
                                >
                                  {improvement}
                                </li>

                              )
                            )}

                          </ul>

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default InterviewPreparation;