
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import ResumeAnalysis from "./pages/ResumeAnalysis";
import ResumeAnalysisDetails from "./pages/ResumeAnalysisDetails";

import JobMatching from "./pages/JobMatching";
import JobMatchDetails from "./pages/JobMatchDetails";

import CareerRoadmap from "./pages/CareerRoadmap";
import CareerRoadmapDetails from "./pages/CareerRoadmapDetails";

import InterviewPreparation from "./pages/InterviewPreparation";
import CareerInsights from "./pages/CareerInsights";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Resume Analysis */}
        <Route
          path="/resume-analysis"
          element={<ResumeAnalysis />}
        />

        <Route
          path="/resume-analysis/:id"
          element={<ResumeAnalysisDetails />}
        />

        {/* Job Matching */}
        <Route
          path="/job-matching"
          element={<JobMatching />}
        />

        <Route
          path="/job-matching/:id"
          element={<JobMatchDetails />}
        />

        {/* AI Career Roadmap */}
        <Route
          path="/career-roadmap"
          element={<CareerRoadmap />}
        />

        <Route
          path="/career-roadmap/:id"
          element={<CareerRoadmapDetails />}
        />

        {/* Interview Preparation */}
        <Route
          path="/interview-preparation"
          element={<InterviewPreparation />}
        />

        {/* Career Insights */}
        <Route
          path="/career-insights"
          element={<CareerInsights />}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
