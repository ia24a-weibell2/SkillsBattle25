// Rating model (upsert logic)

const { query } = require("../db/queries");

async function upsertRating({ userId, puzzleId, rating }) {
  await query(
    "INSERT INTO ratings (user_id, puzzle_id, rating) VALUES (?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE rating = VALUES(rating), rated_at = CURRENT_TIMESTAMP",
    [userId, puzzleId, rating]
  );

  const rows = await query(
    "SELECT AVG(rating) AS avgRating FROM ratings WHERE puzzle_id = ?",
    [puzzleId]
  );
  const avgRating = rows[0]?.avgRating ?? null;
  await query("UPDATE puzzles SET avg_rating = ? WHERE id = ?", [avgRating, puzzleId]);
  return avgRating;
}

module.exports = {
  upsertRating,
};
