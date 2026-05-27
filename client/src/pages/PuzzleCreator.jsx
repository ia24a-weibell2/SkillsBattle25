import React, { useMemo, useState } from "react";
import { api } from "../services/api";

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cellKey(row, col) {
  return `${row}-${col}`;
}

function cageColor(index) {
  const palette = [
    "#e0f2fe",
    "#fce7f3",
    "#ecfccb",
    "#ede9fe",
    "#ffe4e6",
    "#fef3c7",
    "#dcfce7",
    "#e2e8f0",
    "#fee2e2",
    "#cffafe",
    "#f3e8ff",
    "#f5f5f4",
  ];
  return palette[index % palette.length];
}

function areCellsOrthogonallyConnected(selectedKeys) {
  if (selectedKeys.length <= 1) return true;
  const coords = selectedKeys.map((key) => key.split("-").map(Number));
  const keySet = new Set(selectedKeys);
  const visited = new Set();
  const queue = [coords[0]];
  visited.add(`${coords[0][0]}-${coords[0][1]}`);

  while (queue.length > 0) {
    const [row, col] = queue.shift();
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];
    for (const [nr, nc] of neighbors) {
      const nkey = `${nr}-${nc}`;
      if (!keySet.has(nkey) || visited.has(nkey)) continue;
      visited.add(nkey);
      queue.push([nr, nc]);
    }
  }

  return visited.size === selectedKeys.length;
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
      setMessage("Cell already in a cage - delete it first.");
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
    if (!areCellsOrthogonallyConnected(selected)) {
      setMessage("Cells must be orthogonally connected (no diagonal-only cages).");
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

  const handleDeleteCage = (cageIndex) => {
    setCages((prev) => prev.filter((_, idx) => idx !== cageIndex));
  };

  const handleEditCageSum = (cageIndex) => {
    const raw = window.prompt("Enter new target sum:", String(cages[cageIndex].targetSum));
    if (raw === null) return;
    const targetSum = Number(raw);
    if (!Number.isInteger(targetSum) || targetSum < 1) {
      setMessage("Target sum must be a positive integer.");
      return;
    }
    setCages((prev) =>
      prev.map((cage, idx) => (idx === cageIndex ? { ...cage, targetSum } : cage))
    );
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
        style={{
          ...borders,
          backgroundColor: cageIndex !== undefined ? cageColor(cageIndex) : undefined,
        }}
        onClick={() => handleCellClick(row, col)}
        title={cageIndex !== undefined ? "Already in a cage - delete it first" : ""}
      >
        {showSum ? (
          <button
            type="button"
            className="cage-sum-button"
            onClick={(event) => {
              event.stopPropagation();
              handleEditCageSum(cageIndex);
            }}
          >
            {cages[cageIndex].targetSum}
          </button>
        ) : null}
        {cageIndex !== undefined ? (
          <button
            type="button"
            className="cage-delete"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteCage(cageIndex);
            }}
            title="Delete cage"
          >
            x
          </button>
        ) : null}
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
