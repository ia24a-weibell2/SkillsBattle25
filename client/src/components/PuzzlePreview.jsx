import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function cellKey(row, col) {
  return `${row}-${col}`;
}

const CAGE_COLORS = [
  "#e0f2fe", "#fce7f3", "#ecfccb", "#ede9fe", "#ffe4e6",
  "#fef3c7", "#dcfce7", "#e2e8f0", "#fee2e2", "#cffafe",
  "#f3e8ff", "#f5f5f4",
];

function PuzzlePreview({ puzzleId }) {
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    api.getPuzzle(puzzleId).then((data) => setPuzzle(data.puzzle)).catch(() => {});
  }, [puzzleId]);

  const cageByCell = useMemo(() => {
    if (!puzzle) return new Map();
    const map = new Map();
    puzzle.cages.forEach((cage, i) => {
      cage.cells.forEach((cell) => map.set(cellKey(cell.row, cell.col), i));
    });
    return map;
  }, [puzzle]);

  const topLeftByCage = useMemo(() => {
    if (!puzzle) return [];
    return puzzle.cages.map((cage) => {
      let top = cage.cells[0];
      for (const cell of cage.cells) {
        if (cell.row < top.row || (cell.row === top.row && cell.col < top.col)) top = cell;
      }
      return top;
    });
  }, [puzzle]);

  if (!puzzle) return <div className="puzzle-preview-placeholder" />;

  return (
    <div className="puzzle-preview">
      {Array.from({ length: 9 }, (_, r) => (
        <div key={r} className="preview-row">
          {Array.from({ length: 9 }, (_, c) => {
            const key = cellKey(r, c);
            const cageIndex = cageByCell.get(key);
            const topLeft = cageIndex !== undefined ? topLeftByCage[cageIndex] : null;
            const showSum = topLeft && topLeft.row === r && topLeft.col === c;

            const borders = {
              borderTop: "0.5px solid #d1d5db",
              borderRight: "0.5px solid #d1d5db",
              borderBottom: "0.5px solid #d1d5db",
              borderLeft: "0.5px solid #d1d5db",
            };

            if (cageIndex !== undefined) {
              const same = (row, col) => cageByCell.get(cellKey(row, col)) === cageIndex;
              borders.borderTop = r === 0 || !same(r - 1, c) ? "1.5px solid #374151" : "0.5px solid #d1d5db";
              borders.borderBottom = r === 8 || !same(r + 1, c) ? "1.5px solid #374151" : "0.5px solid #d1d5db";
              borders.borderLeft = c === 0 || !same(r, c - 1) ? "1.5px solid #374151" : "0.5px solid #d1d5db";
              borders.borderRight = c === 8 || !same(r, c + 1) ? "1.5px solid #374151" : "0.5px solid #d1d5db";
            }

            return (
              <div
                key={key}
                className="preview-cell"
                style={{
                  ...borders,
                  backgroundColor: cageIndex !== undefined ? CAGE_COLORS[cageIndex % CAGE_COLORS.length] : "#fff",
                }}
              >
                {showSum && (
                  <span className="preview-cage-sum">
                    {puzzle.cages[cageIndex].targetSum}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default PuzzlePreview;
