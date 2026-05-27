import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "../components/RulesModal.jsx";

function Home() {
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const acknowledged = localStorage.getItem("rulesAcknowledged");
    if (!acknowledged) {
      setShowRules(true);
    }
  }, []);

  const handleCloseRules = () => {
    localStorage.setItem("rulesAcknowledged", "true");
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
