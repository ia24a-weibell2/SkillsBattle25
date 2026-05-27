import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function HighScores() {
  const [results, setResults] = useState([]);
  const [puzzleId, setPuzzleId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .highscores(puzzleId ? Number(puzzleId) : null)
      .then((data) => setResults(data.results || []))
      .catch((err) => setError(err.message));
  }, [puzzleId]);

  return (
    <section className="page">
      <div className="page-header">
        <h2>High Scores</h2>
        <input
          placeholder="Filter by puzzle id"
          value={puzzleId}
          onChange={(event) => setPuzzleId(event.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>Puzzle</th>
            <th>User</th>
            <th>Time (s)</th>
            <th>Hints</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.id}>
              <td>{row.puzzle_id}</td>
              <td>{row.username ?? "Deleted User"}</td>
              <td>{row.time_seconds}</td>
              <td>{row.hints_used}</td>
              <td>{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {results.length === 0 && <p className="empty">No results yet.</p>}
    </section>
  );
}

export default HighScores;
