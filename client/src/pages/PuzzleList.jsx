import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function PuzzleList() {
  const [puzzles, setPuzzles] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadPuzzles = async (selected) => {
    setError("");
    setLoading(true);
    try {
      const value = selected === "" ? null : Number(selected);
      const data = await api.listPuzzles(value);
      setPuzzles(data.puzzles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPuzzles(difficulty);
  }, [difficulty]);

  return (
    <section className="page">
      <div className="page-header">
        <h2>Browse Puzzles</h2>
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value="">All difficulties</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>
      </div>
      {loading && <p>Loading puzzles...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && puzzles.length === 0 && (
        <p className="empty">No puzzles found for this difficulty.</p>
      )}
      <div className="grid-list">
        {puzzles.map((puzzle) => (
          <button
            key={puzzle.id}
            className="card puzzle-card"
            onClick={() => navigate(`/puzzles/${puzzle.id}`)}
            type="button"
          >
            <h3>Puzzle #{puzzle.id}</h3>
            <p>Difficulty: {puzzle.difficulty}</p>
            <p>Creator: {puzzle.creator_username}</p>
            <p>Average rating: {puzzle.avg_rating ?? "N/A"}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PuzzleList;
