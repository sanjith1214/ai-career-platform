import {
  useEffect,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import "./CareerRoadmap.css";


function CareerRoadmapDetails() {

  const { id } = useParams();

  const navigate =
    useNavigate();

  const [roadmap, setRoadmap] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const fetchRoadmap = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `http://localhost:5000/api/roadmap/${id}`,
            {
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
            "Failed to fetch roadmap"
          );

        }


        setRoadmap(
          data.roadmap
        );


      } catch (error) {

        console.error(error);

        setError(
          error.message
        );

      } finally {

        setLoading(false);

      }

    };


    fetchRoadmap();

  }, [id]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="roadmap-page">

        <div className="roadmap-container">

          <p>
            Loading roadmap...
          </p>

        </div>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <div className="roadmap-page">

        <div className="roadmap-container">

          <button
            className="back-button"
            onClick={() =>
              navigate(
                "/career-roadmap"
              )
            }
          >
            ← Back to Roadmap
          </button>


          <div className="roadmap-error">

            {error}

          </div>

        </div>

      </div>
    );

  }


  // ==========================================
  // ROADMAP NOT FOUND
  // ==========================================

  if (!roadmap) {

    return (
      <div className="roadmap-page">

        <div className="roadmap-container">

          <button
            className="back-button"
            onClick={() =>
              navigate(
                "/career-roadmap"
              )
            }
          >
            ← Back to Roadmap
          </button>


          <div className="roadmap-empty">

            <h2>
              Roadmap Not Found
            </h2>

          </div>

        </div>

      </div>
    );

  }


  return (

    <div className="roadmap-page">

      <div className="roadmap-container">


        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() =>
            navigate(
              "/career-roadmap"
            )
          }
        >
          ← Back to Roadmaps
        </button>


        {/* HEADER */}

        <div className="roadmap-introduction">

          <h1>
            {roadmap.title}
          </h1>

          <p>
            {roadmap.summary}
          </p>

        </div>


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


      </div>

    </div>

  );

}


export default CareerRoadmapDetails;