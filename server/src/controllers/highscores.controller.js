// Highscores controller logic

const { query } = require("../db/queries");

async function list(req, res, next) {
  try {
    const puzzleId = req.query.puzzleId ? Number(req.query.puzzleId) : null;
    let sql =
      "SELECT results.*, users.username FROM results " +
      "LEFT JOIN users ON users.id = results.user_id";
    const params = [];
    if (puzzleId) {
      sql += " WHERE results.puzzle_id = ?";
      params.push(puzzleId);
    }
    sql += " ORDER BY results.score DESC, results.time_seconds ASC";

    const rows = await query(sql, params);
    return res.json({ results: rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
};
