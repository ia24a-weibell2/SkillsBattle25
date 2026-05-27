import React, { useState } from "react";

function RulesModal({ isOpen, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>How to Play Killer Sudoku</h2>
        <p>
          Fill every row, column, and 3x3 box with digits 1-9. Each cage must sum to
          the corner number, with no repeated digits inside a cage. Every puzzle has
          exactly one solution.
        </p>
        <div className="modal-images">
          <figure>
            <img
              src="/assets/unsolved_example.png"
              alt="Unsolved puzzle with cage outlines"
            />
            <figcaption>Unsolved puzzle - note the cage outlines and corner sums</figcaption>
          </figure>
          <figure>
            <img src="/assets/solution_example.png" alt="Solved puzzle" />
            <figcaption>Solved puzzle - every cage sum is satisfied</figcaption>
          </figure>
        </div>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          Don't show again
        </label>
        <button
          className="primary-button"
          onClick={() => onClose(dontShowAgain)}
          type="button"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
}

export default RulesModal;
