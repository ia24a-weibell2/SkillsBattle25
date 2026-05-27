import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import RatingWidget from "../components/RatingWidget.jsx";

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function PuzzleSolver() {
  const { id } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    let timer;
    if (puzzle && !solved) {
      timer = setInterval(() => setTimeSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [puzzle, solved]);

  useEffect(() => {
    api.getPuzzle(id).then((data) => setPuzzle(data.puzzle)).catch(() => {});
  }, [id]);

  const updateCell = (row, col, value) => {
    if (solved) return;
    const next = grid.map((r) => r.slice());
    next[row][col] = value;
    setGrid(next);
  };

  const handleHint = async () => {
    try {
      const data = await api.hint(id, { grid });
      const { row, col, value } = data.hint;
      updateCell(row, col, value);
      setHintsUsed((prev) => prev + 1);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleCheck = async () => {
    try {
      const data = await api.solvePuzzle(id, { grid, timeSeconds, hintsUsed });
      setMessage(`Correct! Score: ${data.score}`);
      setSolved(true);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleAutoSolve = async () => {
    try {
      const data = await api.autosolve(id);
      setGrid(data.solution);
      setSolved(true);
      setMessage("Auto-solved.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleRate = async (value) => {
    if (!solved) return;
    try {
      await api.ratePuzzle(id, { rating: value });
      setMessage(`Thanks for rating ${value} stars!`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page">
      <h2>Puzzle #{id}</h2>
      {!puzzle && <p>Loading puzzle...</p>}
      {puzzle && (
        <div className="solver-layout">
          <div>
            <div className="grid">
              {grid.map((row, r) => (
                <div key={r} className="grid-row">
                  {row.map((value, c) => (
                    <input
                      key={`${r}-${c}`}
                      className="grid-cell"
                      value={value === 0 ? "" : value}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value || 0);
                        if (Number.isNaN(nextValue) || nextValue < 0 || nextValue > 9) return;
                        updateCell(r, c, nextValue);
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="small">Cages loaded: {puzzle.cages.length}</p>
          </div>
          <aside className="solver-panel">
            <p>Time: {timeSeconds}s</p>
            <p>Hints used: {hintsUsed}</p>
            <div className="button-row">
              <button className="secondary-button" type="button" onClick={handleHint}>
                Hint
              </button>
              <button className="primary-button" type="button" onClick={handleCheck}>
                Check solution
              </button>
              <button className="secondary-button" type="button" onClick={handleAutoSolve}>
                Auto-solve
              </button>
            </div>
            {message && <p className="message">{message}</p>}
            {solved && <RatingWidget onRate={handleRate} />}
          </aside>
        </div>
      )}
    </section>
  );
}

export default PuzzleSolver;
