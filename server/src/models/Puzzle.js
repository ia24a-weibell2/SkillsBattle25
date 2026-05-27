// Puzzle model (cages, cells)

const { query, transaction } = require("../db/queries");

async function createPuzzle({ creatorId, difficulty, cages }) {
  return transaction(async (connection) => {
    const [puzzleResult] = await connection.execute(
      "INSERT INTO puzzles (creator_id, difficulty, is_solvable) VALUES (?, ?, ?)",
      [creatorId, difficulty, true]
    );
    const puzzleId = puzzleResult.insertId;

    for (const cage of cages) {
      const [cageResult] = await connection.execute(
        "INSERT INTO cages (puzzle_id, target_sum) VALUES (?, ?)",
        [puzzleId, cage.targetSum]
      );
      const cageId = cageResult.insertId;
      for (const cell of cage.cells) {
        await connection.execute(
          "INSERT INTO cage_cells (cage_id, row_index, col_index) VALUES (?, ?, ?)",
          [cageId, cell.row, cell.col]
        );
      }
    }

    return puzzleId;
  });
}

async function listPuzzles({ difficulty }) {
  const params = [];
  let sql =
    "SELECT puzzles.*, users.username AS creator_username FROM puzzles " +
    "JOIN users ON users.id = puzzles.creator_id";
  if (difficulty) {
    sql += " WHERE puzzles.difficulty = ?";
    params.push(difficulty);
  }
  sql += " ORDER BY puzzles.created_at DESC";
  return query(sql, params);
}

async function getPuzzleById(puzzleId) {
  const puzzles = await query("SELECT * FROM puzzles WHERE id = ?", [puzzleId]);
  if (puzzles.length === 0) return null;

  const cages = await query("SELECT * FROM cages WHERE puzzle_id = ?", [puzzleId]);
  if (cages.length === 0) return { ...puzzles[0], cages: [] };

  const cageIds = cages.map((cage) => cage.id);
  const placeholders = cageIds.map(() => "?").join(",");
  const cells = await query(
    `SELECT * FROM cage_cells WHERE cage_id IN (${placeholders})`,
    cageIds
  );

  const cagesById = new Map();
  for (const cage of cages) {
    cagesById.set(cage.id, {
      id: cage.id,
      targetSum: cage.target_sum,
      cells: [],
    });
  }
  for (const cell of cells) {
    const cage = cagesById.get(cell.cage_id);
    if (cage) {
      cage.cells.push({ row: cell.row_index, col: cell.col_index });
    }
  }

  return {
    ...puzzles[0],
    cages: Array.from(cagesById.values()),
  };
}

module.exports = {
  createPuzzle,
  listPuzzles,
  getPuzzleById,
};
