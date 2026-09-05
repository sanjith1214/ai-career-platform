import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Hero />

      <section className="features-section" id="features">

        <div className="features-header">

          <h2>
            Everything You Need to Build Your Career
          </h2>

          <p>
            Powerful AI tools designed to help you prepare,
            improve your skills, and land your dream job.
          </p>

        </div>

        <div className="feature-grid">

          <FeatureCard
            icon="📄"
            title="Resume Analysis"
            description="Upload your resume and get AI-powered feedback, skill analysis, and improvement suggestions."
          />

          <FeatureCard
            icon="💼"
            title="Job Matching"
            description="Discover jobs that match your skills, experience, education, and career goals."
          />

          <FeatureCard
            icon="🎤"
            title="Interview Preparation"
            description="Practice interview questions with AI and improve your technical and communication skills."
          />

          <FeatureCard
            icon="🧠"
            title="AI Career Mentor"
            description="Get personalized career guidance and answers to your career-related questions."
          />

          <FeatureCard
            icon="📚"
            title="Learning Roadmap"
            description="Get a personalized roadmap showing the skills and technologies you should learn next."
          />

          <FeatureCard
            icon="📊"
            title="Skill Tracker"
            description="Track your skills, progress, weaknesses, and career development over time."
          />

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Home;