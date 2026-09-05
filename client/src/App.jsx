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

import "./App.css";


function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ==============================
            HOME
        ============================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ==============================
            AUTHENTICATION
        ============================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==============================
            DASHBOARD
        ============================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ==============================
            RESUME ANALYSIS
        ============================== */}

        <Route
          path="/resume-analysis"
          element={<ResumeAnalysis />}
        />

        <Route
          path="/resume-analysis/:id"
          element={
            <ResumeAnalysisDetails />
          }
        />


        {/* ==============================
            JOB MATCHING
        ============================== */}

        <Route
          path="/job-matching"
          element={<JobMatching />}
        />

        <Route
          path="/job-matching/:id"
          element={
            <JobMatchDetails />
          }
        />


        {/* ==============================
            AI CAREER ROADMAP
        ============================== */}

        <Route
          path="/career-roadmap"
          element={
            <CareerRoadmap />
          }
        />

        <Route
          path="/career-roadmap/:id"
          element={
            <CareerRoadmapDetails />
          }
        />

      </Routes>


      <Footer />
    </>
  );
}


export default App;