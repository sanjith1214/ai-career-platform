import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo">
        AI Career
      </Link>

      <div className="navbar-links">
        <Link to="/">
          Home
        </Link>

        <a href="/#features">
          Features
        </a>
      </div>

      <div className="navbar-actions">

        {token ? (
          <>
            <Link
              to="/dashboard"
              className="nav-login"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="nav-register"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-login"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="nav-register"
            >
              Get Started
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;