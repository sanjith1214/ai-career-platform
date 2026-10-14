
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";

import { registerUser } from "../services/api";
import "./Login.css";

const API_URL = "http://localhost:5000/api";

function RegisterContent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Email and password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Google registration / sign-in
  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");

    const credential = credentialResponse?.credential;

    if (!credential) {
      setMessage("Google did not return a sign-in credential.");
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google sign-in failed.");
      }

      if (!data?.token) {
        throw new Error("Server response did not contain a token.");
      }

      localStorage.setItem("token", data.token);

      if (data.user?.name) {
        localStorage.setItem("userName", data.user.name);
      }

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Start your AI-powered career journey
        </p>

        {message && (
          <p className="auth-error" role="alert">
            {message}
          </p>
        )}

        {/* Registration form comes first */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            disabled={loading || googleLoading}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading || googleLoading}
          />

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            disabled={loading || googleLoading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            disabled={loading || googleLoading}
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Divider between registration methods */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Sign-Up comes below the form */}
        <div className="google-login-container">
          {googleLoading ? (
            <p>Signing in with Google...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setMessage(
                  "Google sign-in was unsuccessful. Please try again."
                )
              }
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          )}
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

function Register() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Configuration Required</h1>

          <p className="auth-error">
            Google Client ID is missing. Check client/.env and restart Vite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RegisterContent />
    </GoogleOAuthProvider>
  );
}

export default Register;
