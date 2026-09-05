import aiImage from "../assets/ai.png";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-text">

        <div className="hero-badge">
          AI-Powered Career Platform
        </div>

        <h1>
          Build Your Career
          <br />
          <span>Smarter with AI</span>
        </h1>

        <p>
          Analyze your resume, match jobs, prepare for interviews,
          and improve your skills using powerful AI tools.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">
            Get Started
          </button>

          <a href="#features" className="secondary-btn">
            Explore Features
          </a>
        </div>

      </div>

      <div className="hero-image">
        <img src={aiImage} alt="AI Career Assistant" />
      </div>

    </section>
  );
}

export default Hero;