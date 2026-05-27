// Result model (score calculation)

const { query } = require("../db/queries");
const { calculateScore } = require("../services/scoring");

function computeScore(timeSeconds, hintsUsed) {
  return calculateScore(timeSeconds, hintsUsed);
}

async function saveResult({ userId, puzzleId, timeSeconds, hintsUsed }) {
  const score = calculateScore(timeSeconds, hintsUsed);
  const result = await query(
    "INSERT INTO results (user_id, puzzle_id, time_seconds, hints_used, score) VALUES (?, ?, ?, ?, ?)",
    [userId, puzzleId, timeSeconds, hintsUsed, score]
  );
  return { id: result.insertId, score };
}

module.exports = {
  computeScore,
  saveResult,
};
