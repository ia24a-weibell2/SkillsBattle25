const { solveKillerSudoku } = require("../src/services/solver");

const solvedGrid = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function cagesFromGrid(grid, options = {}) {
  const cages = [];
  const pairOnesTwos = options.pairOnesTwos === true;
  const oneTwoCells = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = grid[r][c];
      if (pairOnesTwos && (value === 1 || value === 2)) {
        oneTwoCells.push({ row: r, col: c, value });
      } else {
        cages.push({
          targetSum: value,
          cells: [{ row: r, col: c }],
        });
      }
    }
  }

  if (pairOnesTwos) {
    for (let i = 0; i < oneTwoCells.length; i += 2) {
      const first = oneTwoCells[i];
      const second = oneTwoCells[i + 1];
      cages.push({
        targetSum: 3,
        cells: [
          { row: first.row, col: first.col },
          { row: second.row, col: second.col },
        ],
      });
    }
  }

  return cages;
}

test("solves a uniquely solvable puzzle", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[0][0] = 0;
  grid[4][4] = 0;

  const cages = cagesFromGrid(solvedGrid);
  const result = solveKillerSudoku({ grid, cages });

  expect(result.solution).not.toBeNull();
  expect(result.isUnique).toBe(true);
  expect(result.solution).toEqual(solvedGrid);
});

test("returns null for an unsolvable configuration", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[0][0] = 0;
  const cages = cagesFromGrid(solvedGrid);

  const cage = cages.find((entry) => entry.cells[0].row === 0 && entry.cells[0].col === 0);
  cage.targetSum = 10;

  const result = solveKillerSudoku({ grid, cages });
  expect(result.solution).toBeNull();
});

test("detects multiple solutions when 1/2 digits are swappable", () => {
  const grid = solvedGrid.map((row) => row.slice());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 1 || grid[r][c] === 2) {
        grid[r][c] = 0;
      }
    }
  }

  const cages = cagesFromGrid(solvedGrid, { pairOnesTwos: true });
  const result = solveKillerSudoku({ grid, cages });

  expect(result.solution).not.toBeNull();
  expect(result.isUnique).toBe(false);
});

test("solves an 80-cell pre-filled puzzle", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[8][8] = 0;

  const cages = cagesFromGrid(solvedGrid);
  const result = solveKillerSudoku({ grid, cages });

  expect(result.solution).not.toBeNull();
  expect(result.solution[8][8]).toBe(9);
});
