const {
  minSum,
  maxSum,
  validateSolvedGrid,
  isValidUsername,
  isValidEmail,
  isValidPassword,
  isValidCellValue,
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

test("minSum and maxSum bounds", () => {
  expect(minSum(2)).toBe(3);
  expect(maxSum(2)).toBe(17);
  expect(minSum(3)).toBe(6);
  expect(maxSum(3)).toBe(24);
  expect(minSum(4)).toBe(10);
  expect(maxSum(4)).toBe(30);
});

test("grid sum must equal 405", () => {
  const ok = validateSolvedGrid(solvedGrid);
  expect(ok.ok).toBe(true);

  const bad = solvedGrid.map((row) => row.slice());
  bad[0][0] = 9;
  const result = validateSolvedGrid(bad);
  expect(result.ok).toBe(false);
  expect(result.error).toBe("Grid sum must equal 405");
});

test("username length validation", () => {
  expect(isValidUsername("abc")).toBe(true);
  expect(isValidUsername("a".repeat(30))).toBe(true);
  expect(isValidUsername("ab")).toBe(false);
  expect(isValidUsername("a".repeat(31))).toBe(false);
});

test("password requires 8 chars and a digit", () => {
  expect(isValidPassword("password1")).toBe(true);
  expect(isValidPassword("password")).toBe(false);
  expect(isValidPassword("pass1")).toBe(false);
});

test("cell value range 1-9", () => {
  expect(isValidCellValue(1)).toBe(true);
  expect(isValidCellValue(9)).toBe(true);
  expect(isValidCellValue(0)).toBe(false);
  expect(isValidCellValue(10)).toBe(false);
});

// TC02-B5: password exactly 8 chars with 1 digit
test("password of exactly 8 chars with 1 digit is accepted", () => {
  expect(isValidPassword("Secret1!")).toBe(true);
});

// TC04-B1/B2/B3: single-cell cage (n=1) bounds: min=1, max=9
test("cage sum bounds for n=1 (single-cell cage)", () => {
  expect(minSum(1)).toBe(1);
  expect(maxSum(1)).toBe(9);
  // TC04-B1: sum=1 accepted (equals minSum)
  expect(1 >= minSum(1) && 1 <= maxSum(1)).toBe(true);
  // TC04-B2: sum=9 accepted (equals maxSum)
  expect(9 >= minSum(1) && 9 <= maxSum(1)).toBe(true);
  // TC04-B3: sum=10 rejected (exceeds maxSum)
  expect(10 > maxSum(1)).toBe(true);
});

// TC04-B4/B5: 9-cell cage (n=9) bounds: min=max=45
test("cage sum bounds for n=9 (full-row cage)", () => {
  expect(minSum(9)).toBe(45);
  expect(maxSum(9)).toBe(45);
  // TC04-B4: sum=45 accepted (only valid value)
  expect(45 >= minSum(9) && 45 <= maxSum(9)).toBe(true);
  // TC04-B5: sum=44 rejected (below minSum)
  expect(44 < minSum(9)).toBe(true);
});
