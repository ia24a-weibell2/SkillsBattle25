// Puzzle controller logic

const { createPuzzle, listPuzzles, getPuzzleById } = require("../models/Puzzle");
const { saveResult } = require("../models/Result");
const { upsertRating } = require("../models/Rating");
const { solveKillerSudoku, getHint } = require("../services/solver");
const {
  isValidDifficulty,
  validateCages,
  validateGridValues,
  validateSolvedGrid,
  checkRowsColsBoxes,
  checkCages,
  isValidRating,
} = require("../services/validation");

function normalizeCages(cages) {
  return cages.map((cage) => ({
    id: cage.id,
    targetSum: cage.targetSum ?? cage.target_sum,
    cells: cage.cells,
  }));
}

async function list(req, res, next) {
  try {
    const difficulty = req.query.difficulty ? Number(req.query.difficulty) : null;
    if (difficulty && !isValidDifficulty(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty" });
    }
    const puzzles = await listPuzzles({ difficulty });
    return res.json({ puzzles });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { difficulty, cages } = req.body;
    if (!isValidDifficulty(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty" });
    }
    const cageError = validateCages(cages);
    if (cageError) {
      return res.status(400).json({ error: cageError });
    }

    const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const { solution, isUnique } = solveKillerSudoku({ grid: emptyGrid, cages });
    if (!solution) {
      return res.status(400).json({ error: "Puzzle has no solution" });
    }
    if (!isUnique) {
      return res.status(400).json({ error: "Puzzle solution is not unique" });
    }

    const puzzleId = await createPuzzle({
      creatorId: req.user.id,
      difficulty,
      cages,
    });

    return res.status(201).json({ id: puzzleId });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const puzzle = await getPuzzleById(Number(req.params.id));
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }
    return res.json({ puzzle });
  } catch (error) {
    return next(error);
  }
}

async function solve(req, res, next) {
  try {
    const puzzle = await getPuzzleById(Number(req.params.id));
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }

    const { grid, timeSeconds, hintsUsed } = req.body;
    const gridError = validateGridValues(grid);
    if (gridError) {
      return res.status(400).json({ error: gridError });
    }

    const solvedCheck = validateSolvedGrid(grid);
    if (!solvedCheck.ok) {
      return res.status(400).json({ error: solvedCheck.error });
    }

    const cages = normalizeCages(puzzle.cages);
    if (!checkRowsColsBoxes(grid) || !checkCages(grid, cages)) {
      return res.status(400).json({ error: "Solution is incorrect" });
    }

    const saved = await saveResult({
      userId: req.user.id,
      puzzleId: puzzle.id,
      timeSeconds: Number(timeSeconds || 0),
      hintsUsed: Number(hintsUsed || 0),
    });

    return res.json({ correct: true, score: saved.score });
  } catch (error) {
    return next(error);
  }
}

async function hint(req, res, next) {
  try {
    const puzzle = await getPuzzleById(Number(req.params.id));
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }

    const { grid } = req.body;
    const gridError = validateGridValues(grid);
    if (gridError) {
      return res.status(400).json({ error: gridError });
    }

    const cages = normalizeCages(puzzle.cages);
    const hintResult = getHint({ grid, cages });
    if (!hintResult) {
      return res.status(404).json({ error: "No hint available" });
    }

    return res.json({ hint: hintResult });
  } catch (error) {
    return next(error);
  }
}

async function autosolve(req, res, next) {
  try {
    const puzzle = await getPuzzleById(Number(req.params.id));
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }

    const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const cages = normalizeCages(puzzle.cages);
    const { solution, isUnique } = solveKillerSudoku({ grid: emptyGrid, cages });
    if (!solution) {
      return res.status(400).json({ error: "Puzzle has no solution" });
    }
    return res.json({ solution, isUnique });
  } catch (error) {
    return next(error);
  }
}

async function rate(req, res, next) {
  try {
    const puzzleId = Number(req.params.id);
    const { rating } = req.body;
    if (!isValidRating(rating)) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    const avgRating = await upsertRating({
      userId: req.user.id,
      puzzleId,
      rating,
    });
    return res.json({ avgRating });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  getById,
  solve,
  hint,
  autosolve,
  rate,
};
