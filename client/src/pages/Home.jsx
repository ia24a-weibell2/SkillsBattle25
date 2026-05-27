import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "../components/RulesModal.jsx";

const RULES_COOKIE = "rulesOptOut";

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/`;
}

function Home() {
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const optOut = getCookie(RULES_COOKIE) === "true";
    setShowRules(!optOut);
  }, []);

  const handleCloseRules = (dontShowAgain) => {
    if (dontShowAgain) {
      setCookie(RULES_COOKIE, "true", 365);
    }
    setShowRules(false);
  };

  return (
    <section className="page home">
      <RulesModal isOpen={showRules} onClose={handleCloseRules} />
      <div className="hero">
        <h1>Killer Sudoku</h1>
        <p>Master the cages. Conquer the sums.</p>
        <div className="hero-actions">
          {!token ? (
            <>
              <button className="primary-button" onClick={() => navigate("/login")} type="button">
                Login
              </button>
              <button className="secondary-button" onClick={() => navigate("/register")} type="button">
                Register
              </button>
            </>
          ) : (
            <button className="primary-button" onClick={() => navigate("/puzzles")} type="button">
              Browse Puzzles
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;
