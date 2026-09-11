import { useState } from "react";

import "./InterviewPreparation.css";


function InterviewPreparation() {

  const [loading, setLoading] = useState(false);

  const [interview, setInterview] = useState(null);

  const [error, setError] = useState("");


  /*
  |--------------------------------------------------------------------------
  | Generate Interview Questions
  |--------------------------------------------------------------------------
  */

  const generateInterview = async () => {

    try {

      setLoading(true);

      setError("");


      /*
      |--------------------------------------------------------------------------
      | Get JWT token
      |--------------------------------------------------------------------------
      */

      const token =
        localStorage.getItem("token");


      /*
      |--------------------------------------------------------------------------
      | Send request to backend
      |--------------------------------------------------------------------------
      */

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


      /*
      |--------------------------------------------------------------------------
      | Convert response to JSON
      |--------------------------------------------------------------------------
      */

      const data =
        await response.json();


      /*
      |--------------------------------------------------------------------------
      | Check for backend error
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to generate interview"
        );

      }


      /*
      |--------------------------------------------------------------------------
      | Store interview data
      |--------------------------------------------------------------------------
      */

      setInterview(
        data.interview
      );


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


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="interview-page">

      <div className="interview-container">


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="interview-header">

          <h1>
            AI Interview Preparation
          </h1>

          <p>
            Generate personalized interview questions
            based on your resume and target job.
          </p>

        </div>


        {/* ==========================================
            GENERATE BUTTON
        ========================================== */}

        <button
          className="generate-interview-button"
          disabled={loading}
          onClick={generateInterview}
        >

          {loading
            ? "Generating..."
            : "Generate Interview Questions"}

        </button>


        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}

        {error && (

          <p className="interview-error">

            {error}

          </p>

        )}


        {/* ==========================================
            INTERVIEW QUESTIONS
        ========================================== */}

        {interview && (

          <div className="interview-questions">

            <h2>
              Interview Questions
            </h2>


            {interview.questions.map(
              (item, index) => (

                <div
                  className="interview-question-card"
                  key={index}
                >


                  {/* Question Number */}

                  <h3>
                    Question {index + 1}
                  </h3>


                  {/* Question */}

                  <p className="interview-question">

                    {item.question}

                  </p>


                  {/* Question Information */}

                  <div className="interview-meta">

                    <span className="interview-badge">

                      Type: {item.type}

                    </span>


                    <span className="interview-badge">

                      Difficulty: {item.difficulty}

                    </span>

                  </div>

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