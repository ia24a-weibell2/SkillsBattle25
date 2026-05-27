// Score calculation helpers

const BASE_SCORE = 10000;
const TIME_PENALTY = 1;
const HINT_PENALTY = 500;

function calculateScore(timeSeconds, hintsUsed) {
  const score = BASE_SCORE - timeSeconds * TIME_PENALTY - hintsUsed * HINT_PENALTY;
  return Math.max(0, Math.trunc(score));
}

module.exports = {
  calculateScore,
  BASE_SCORE,
  TIME_PENALTY,
  HINT_PENALTY,
};
