// Killer Sudoku solver (pure function, no I/O)

const SIZE = 9;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function cloneGrid(grid) {
  return grid.map((row) => row.slice());
}

function boxIndex(row, col) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function buildCageMap(cages) {
  const cageByCell = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const cageList = cages.map((cage, idx) => ({
    id: cage.id ?? idx,
    targetSum: cage.targetSum,
    cells: cage.cells.map((cell) => ({ row: cell.row, col: cell.col })),
  }));

  for (const cage of cageList) {
    for (const cell of cage.cells) {
      if (cageByCell[cell.row][cell.col]) {
        throw new Error("Cell belongs to multiple cages");
      }
      cageByCell[cell.row][cell.col] = cage;
    }
  }

  return { cageByCell, cageList };
}

function computeUsed(grid) {
  const rows = Array.from({ length: SIZE }, () => new Set());
  const cols = Array.from({ length: SIZE }, () => new Set());
  const boxes = Array.from({ length: SIZE }, () => new Set());

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        rows[r].add(val);
        cols[c].add(val);
        boxes[boxIndex(r, c)].add(val);
      }
    }
  }

  return { rows, cols, boxes };
}

function getCageState(cage, grid) {
  let sum = 0;
  const used = new Set();
  const empty = [];
  for (const cell of cage.cells) {
    const val = grid[cell.row][cell.col];
    if (val === 0) {
      empty.push(cell);
    } else {
      sum += val;
      used.add(val);
    }
  }
  return { sum, used, emptyCount: empty.length };
}

function minPossibleSum(count, excluded) {
  if (count <= 0) return 0;
  let sum = 0;
  for (const d of DIGITS) {
    if (excluded.has(d)) continue;
    sum += d;
    if (--count === 0) break;
  }
  return sum;
}

function maxPossibleSum(count, excluded) {
  if (count <= 0) return 0;
  let sum = 0;
  for (let i = DIGITS.length - 1; i >= 0; i--) {
    const d = DIGITS[i];
    if (excluded.has(d)) continue;
    sum += d;
    if (--count === 0) break;
  }
  return sum;
}

function getCandidates(grid, r, c, used, cageByCell) {
  if (grid[r][c] !== 0) return [];

  const rowUsed = used.rows[r];
  const colUsed = used.cols[c];
  const boxUsed = used.boxes[boxIndex(r, c)];
  const cage = cageByCell[r][c];

  const cageState = cage ? getCageState(cage, grid) : null;
  const candidates = [];

  for (const d of DIGITS) {
    if (rowUsed.has(d) || colUsed.has(d) || boxUsed.has(d)) continue;
    if (cageState && cageState.used.has(d)) continue;

    if (cageState) {
      const remaining = cageState.emptyCount - 1;
      const nextSum = cageState.sum + d;
      const minRest = minPossibleSum(remaining, cageState.used);
      const maxRest = maxPossibleSum(remaining, cageState.used);
      if (nextSum + minRest > cage.targetSum) continue;
      if (nextSum + maxRest < cage.targetSum) continue;
      if (remaining === 0 && nextSum !== cage.targetSum) continue;
    }

    candidates.push(d);
  }

  return candidates;
}

function findNextCell(grid, used, cageByCell) {
  let best = null;
  let bestCandidates = null;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = getCandidates(grid, r, c, used, cageByCell);
      if (candidates.length === 0) return { row: r, col: c, candidates: [] };
      if (!best || candidates.length < bestCandidates.length) {
        best = { row: r, col: c, candidates };
        bestCandidates = candidates;
        if (candidates.length === 1) return best;
      }
    }
  }

  return best;
}

function isComplete(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  return true;
}

function solveKillerSudoku(input) {
  const grid = cloneGrid(input.grid);
  const { cageByCell, cageList } = buildCageMap(input.cages);
  const used = computeUsed(grid);

  for (const cage of cageList) {
    const state = getCageState(cage, grid);
    if (state.sum > cage.targetSum) return { solution: null, isUnique: false };
    const minRest = minPossibleSum(state.emptyCount, state.used);
    const maxRest = maxPossibleSum(state.emptyCount, state.used);
    if (state.sum + minRest > cage.targetSum) return { solution: null, isUnique: false };
    if (state.sum + maxRest < cage.targetSum) return { solution: null, isUnique: false };
  }

  let solution = null;
  let solutionCount = 0;

  function backtrack() {
    if (solutionCount > 1) return;
    if (isComplete(grid)) {
      solutionCount += 1;
      if (!solution) solution = cloneGrid(grid);
      return;
    }

    const next = findNextCell(grid, used, cageByCell);
    if (!next || next.candidates.length === 0) return;

    for (const candidate of next.candidates) {
      const { row, col } = next;
      grid[row][col] = candidate;
      used.rows[row].add(candidate);
      used.cols[col].add(candidate);
      used.boxes[boxIndex(row, col)].add(candidate);

      backtrack();

      used.rows[row].delete(candidate);
      used.cols[col].delete(candidate);
      used.boxes[boxIndex(row, col)].delete(candidate);
      grid[row][col] = 0;

      if (solutionCount > 1) return;
    }
  }

  backtrack();

  if (!solution) return { solution: null, isUnique: false };
  return { solution, isUnique: solutionCount === 1 };
}

function getHint(input) {
  const { solution } = solveKillerSudoku(input);
  if (!solution) return null;

  const grid = input.grid;
  const { cageByCell } = buildCageMap(input.cages);
  const used = computeUsed(grid);

  let best = null;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = getCandidates(grid, r, c, used, cageByCell);
      if (candidates.length === 0) continue;
      if (!best || candidates.length < best.candidates.length) {
        best = { row: r, col: c, candidates };
      }
    }
  }

  if (!best) return null;
  return { row: best.row, col: best.col, value: solution[best.row][best.col] };
}

module.exports = {
  solveKillerSudoku,
  getHint,
};
