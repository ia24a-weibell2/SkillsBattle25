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

function cagesFromGrid(grid) {
  const cages = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cages.push({ targetSum: grid[r][c], cells: [{ row: r, col: c }] });
    }
  }
  return cages;
}

test("UC-11: autosolve returns a solution", () => {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const cages = cagesFromGrid(solvedGrid);
  const { solution, isUnique } = solveKillerSudoku({ grid: emptyGrid, cages });
  expect(solution).not.toBeNull();
  expect(isUnique).toBe(true);
});

test("UC-11: unsolvable returns null", () => {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const cages = cagesFromGrid(solvedGrid);
  cages[0].targetSum = 20;
  const { solution } = solveKillerSudoku({ grid: emptyGrid, cages });
  expect(solution).toBeNull();
});

test("UC-11: nearly complete puzzle solves", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[8][8] = 0;
  const cages = cagesFromGrid(solvedGrid);
  const { solution } = solveKillerSudoku({ grid, cages });
  expect(solution).not.toBeNull();
  expect(solution[8][8]).toBe(9);
});

