import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">Killer Sudoku</div>
      <nav className="navbar-links">
        <NavLink to="/">Home</NavLink>
        {token ? (
          <>
            <NavLink to="/puzzles">Browse</NavLink>
            <NavLink to="/create">Create</NavLink>
            <NavLink to="/highscores">High Scores</NavLink>
            <NavLink to="/account">Account</NavLink>
            <button className="link-button" onClick={handleLogout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
