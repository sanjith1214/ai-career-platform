
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { loginUser } from "../services/api";
import "./Login.css";

const API_URL = "http://localhost:5000/api";

function LoginContent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Email and password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!data?.token) {
        throw new Error("Login response did not contain a token.");
      }

      localStorage.setItem("token", data.token);

      if (data.user?.name) {
        localStorage.setItem("userName", data.user.name);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    const credential = credentialResponse?.credential;

    if (!credential) {
      setError("Google sign-in did not return a credential.");
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
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue your career journey
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {/* Email and password form first */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
            disabled={loading || googleLoading}
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={loading || googleLoading}
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider between the two login methods */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Sign-In below the form */}
        <div className="google-login-container">
          {googleLoading ? (
            <p>Signing in with Google...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError("Google sign-in was unsuccessful. Please try again.")
              }
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          )}
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

function Login() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Configuration Required</h1>
          <p className="auth-error">
            Google Client ID is missing. Check client/.env and restart
            the Vite development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}

export default Login;

