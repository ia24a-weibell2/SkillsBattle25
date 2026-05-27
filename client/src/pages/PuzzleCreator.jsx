import React, { useMemo, useState } from "react";
import { api } from "../services/api";

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cellKey(row, col) {
  return `${row}-${col}`;
}

function PuzzleCreator() {
  const [difficulty, setDifficulty] = useState(2);
  const [cages, setCages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const grid = useMemo(() => createEmptyGrid(), []);

  const cageByCell = useMemo(() => {
    const map = new Map();
    cages.forEach((cage, cageIndex) => {
      cage.cells.forEach((cell) => {
        map.set(cellKey(cell.row, cell.col), cageIndex);
      });
    });
    return map;
  }, [cages]);

  const topLeftByCage = useMemo(() => {
    return cages.map((cage) => {
      let top = cage.cells[0];
      for (const cell of cage.cells) {
        if (cell.row < top.row || (cell.row === top.row && cell.col < top.col)) {
          top = cell;
        }
      }
      return top;
    });
  }, [cages]);

  const handleCellClick = (row, col) => {
    setMessage("");
    const key = cellKey(row, col);
    if (cageByCell.has(key)) {
      setMessage("Cell already belongs to a cage.");
      return;
    }
    setSelected((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const handleCreateCage = () => {
    setMessage("");
    if (selected.length === 0) {
      setMessage("Select at least one cell to create a cage.");
      return;
    }
    const raw = window.prompt("Enter target sum for this cage:");
    if (raw === null) return;
    const targetSum = Number(raw);
    if (!Number.isInteger(targetSum) || targetSum < 1) {
      setMessage("Target sum must be a positive integer.");
      return;
    }

    const cells = selected.map((key) => {
      const [row, col] = key.split("-").map(Number);
      return { row, col };
    });

    setCages((prev) => [...prev, { targetSum, cells }]);
    setSelected([]);
  };

  const handleSave = async () => {
    setMessage("");
    if (cageByCell.size !== 81) {
      setMessage("All 81 cells must be assigned to cages before saving.");
      return;
    }
    try {
      const data = await api.createPuzzle({ difficulty: Number(difficulty), cages });
      setMessage(`Puzzle saved with id ${data.id}`);
      setCages([]);
      setSelected([]);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const renderCell = (row, col) => {
    const key = cellKey(row, col);
    const cageIndex = cageByCell.get(key);
    const isSelected = selected.includes(key);

    const borders = {
      borderTop: "1px solid #cbd5f5",
      borderRight: "1px solid #cbd5f5",
      borderBottom: "1px solid #cbd5f5",
      borderLeft: "1px solid #cbd5f5",
    };

    if (cageIndex !== undefined) {
      const same = (r, c) => cageByCell.get(cellKey(r, c)) === cageIndex;
      borders.borderTop = row === 0 || !same(row - 1, col) ? "2px dashed #4b5563" : "1px solid #cbd5f5";
      borders.borderBottom = row === 8 || !same(row + 1, col) ? "2px dashed #4b5563" : "1px solid #cbd5f5";
      borders.borderLeft = col === 0 || !same(row, col - 1) ? "2px dashed #4b5563" : "1px solid #cbd5f5";
      borders.borderRight = col === 8 || !same(row, col + 1) ? "2px dashed #4b5563" : "1px solid #cbd5f5";
    }

    const topLeft = cageIndex !== undefined ? topLeftByCage[cageIndex] : null;
    const showSum = topLeft && topLeft.row === row && topLeft.col === col;

    return (
      <button
        key={key}
        type="button"
        className={`creator-cell ${isSelected ? "selected" : ""}`}
        style={borders}
        onClick={() => handleCellClick(row, col)}
      >
        {showSum ? <span className="cage-sum">{cages[cageIndex].targetSum}</span> : null}
      </button>
    );
  };

  return (
    <section className="page">
      <h2>Create Puzzle</h2>
      <div className="creator-layout">
        <div className="creator-grid">
          {grid.map((row, r) => (
            <div key={r} className="grid-row">
              {row.map((_, c) => renderCell(r, c))}
            </div>
          ))}
        </div>
        <aside className="card creator-panel">
          <label>
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </label>
          <p>Selected cells: {selected.length}</p>
          <p>Cages created: {cages.length}</p>
          <p>Cells assigned: {cageByCell.size}/81</p>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={handleCreateCage}>
              Create cage
            </button>
            <button className="primary-button" type="button" onClick={handleSave}>
              Save puzzle
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </aside>
      </div>
    </section>
  );
}

export default PuzzleCreator;
