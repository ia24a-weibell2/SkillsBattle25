const { getHint } = require("../src/services/solver");

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

// TC07-P1: hint reveals a correct cell value on a partially filled grid
test("UC-07 TC07-P1: hint reveals one correct cell value", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[0][0] = 0;
  const cages = cagesFromGrid(solvedGrid);

  const hint = getHint({ grid, cages });

  expect(hint).not.toBeNull();
  expect(hint.value).toBe(solvedGrid[hint.row][hint.col]);
  expect(grid[hint.row][hint.col]).toBe(0);
});

// TC07-P2: requesting 3 hints in sequence reveals 3 distinct, correct cells
test("UC-07 TC07-P2: three sequential hints reveal three distinct cells", () => {
  let grid = solvedGrid.map((row) => row.slice());
  grid[0][0] = 0;
  grid[1][1] = 0;
  grid[2][2] = 0;
  grid[3][3] = 0;
  const cages = cagesFromGrid(solvedGrid);

  const revealed = new Set();
  for (let i = 0; i < 3; i++) {
    const hint = getHint({ grid, cages });
    expect(hint).not.toBeNull();
    const key = `${hint.row}-${hint.col}`;
    expect(revealed.has(key)).toBe(false);
    revealed.add(key);
    expect(hint.value).toBe(solvedGrid[hint.row][hint.col]);
    grid = grid.map((r) => r.slice());
    grid[hint.row][hint.col] = hint.value;
  }
  expect(revealed.size).toBe(3);
});

// TC07-N1: no hint is possible when all cells are already filled
test("UC-07 TC07-N1: returns null when puzzle is already complete", () => {
  const grid = solvedGrid.map((row) => row.slice());
  const cages = cagesFromGrid(solvedGrid);

  const hint = getHint({ grid, cages });

  expect(hint).toBeNull();
});

// TC07-B1: hint when exactly one cell is empty reveals that cell
test("UC-07 TC07-B1: hint with only 1 empty cell reveals that cell", () => {
  const grid = solvedGrid.map((row) => row.slice());
  grid[8][8] = 0;
  const cages = cagesFromGrid(solvedGrid);

  const hint = getHint({ grid, cages });

  expect(hint).not.toBeNull();
  expect(hint.row).toBe(8);
  expect(hint.col).toBe(8);
  expect(hint.value).toBe(solvedGrid[8][8]);
});
