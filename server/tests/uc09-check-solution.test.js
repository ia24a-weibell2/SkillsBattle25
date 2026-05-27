const {
  validateSolvedGrid,
  checkRowsColsBoxes,
  checkCages,
} = require("../src/services/validation");

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

test("UC-09: correct solution passes full check", () => {
  const cages = cagesFromGrid(solvedGrid);
  const sumCheck = validateSolvedGrid(solvedGrid);
  expect(sumCheck.ok).toBe(true);
  expect(checkRowsColsBoxes(solvedGrid)).toBe(true);
  expect(checkCages(solvedGrid, cages)).toBe(true);
});

test("UC-09: wrong cell fails", () => {
  const cages = cagesFromGrid(solvedGrid);
  const bad = solvedGrid.map((row) => row.slice());
  bad[0][0] = 8;
  expect(checkRowsColsBoxes(bad)).toBe(false);
  expect(checkCages(bad, cages)).toBe(false);
});

test("UC-09: sum != 405 fails quick check", () => {
  const bad = solvedGrid.map((row) => row.slice());
  bad[0][0] = 9;
  const sumCheck = validateSolvedGrid(bad);
  expect(sumCheck.ok).toBe(false);
  expect(sumCheck.error).toBe("Grid sum must equal 405");
});

test("UC-09: wrong cage sum fails", () => {
  const cages = cagesFromGrid(solvedGrid);
  cages[0].targetSum = 9;
  expect(checkCages(solvedGrid, cages)).toBe(false);
});

