import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import RatingWidget from "../components/RatingWidget.jsx";

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cellKey(row, col) {
  return `${row}-${col}`;
}

function PuzzleSolver() {
  const { id } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);
  const [lastHint, setLastHint] = useState(null);

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

  const cageByCell = useMemo(() => {
    if (!puzzle) return new Map();
    const map = new Map();
    puzzle.cages.forEach((cage, cageIndex) => {
      cage.cells.forEach((cell) => {
        map.set(cellKey(cell.row, cell.col), cageIndex);
      });
    });
    return map;
  }, [puzzle]);

  const topLeftByCage = useMemo(() => {
    if (!puzzle) return [];
    return puzzle.cages.map((cage) => {
      let top = cage.cells[0];
      for (const cell of cage.cells) {
        if (cell.row < top.row || (cell.row === top.row && cell.col < top.col)) {
          top = cell;
        }
      }
      return top;
    });
  }, [puzzle]);

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
      setLastHint({ row, col });
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

  const renderCell = (row, col, value) => {
    const key = cellKey(row, col);
    const cageIndex = cageByCell.get(key);

    const borders = {
      borderTop: "1px solid #d1d5db",
      borderRight: "1px solid #d1d5db",
      borderBottom: "1px solid #d1d5db",
      borderLeft: "1px solid #d1d5db",
    };

    if (cageIndex !== undefined) {
      const same = (r, c) => cageByCell.get(cellKey(r, c)) === cageIndex;
      borders.borderTop = row === 0 || !same(row - 1, col) ? "3px solid #374151" : "1px solid #d1d5db";
      borders.borderBottom = row === 8 || !same(row + 1, col) ? "3px solid #374151" : "1px solid #d1d5db";
      borders.borderLeft = col === 0 || !same(row, col - 1) ? "3px solid #374151" : "1px solid #d1d5db";
      borders.borderRight = col === 8 || !same(row, col + 1) ? "3px solid #374151" : "1px solid #d1d5db";
    }

    const topLeft = cageIndex !== undefined ? topLeftByCage[cageIndex] : null;
    const showSum = topLeft && topLeft.row === row && topLeft.col === col;
    const isHinted = lastHint && lastHint.row === row && lastHint.col === col;

    return (
      <div key={key} className={`grid-cell-wrapper ${isHinted ? "hinted" : ""}`} style={borders}>
        {showSum ? <span className="cage-sum">{puzzle.cages[cageIndex].targetSum}</span> : null}
        <input
          className="grid-cell"
          value={value === 0 ? "" : value}
          onChange={(event) => {
            const nextValue = Number(event.target.value || 0);
            if (Number.isNaN(nextValue) || nextValue < 0 || nextValue > 9) return;
            updateCell(row, col, nextValue);
          }}
        />
      </div>
    );
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
                  {row.map((value, c) => renderCell(r, c, value))}
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
