// Validation helpers for Killer Sudoku rules

function isValidUsername(username) {
  return typeof username === "string" && /^[A-Za-z0-9_]{3,30}$/.test(username);
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8 && /\d/.test(password);
}

function isValidCellValue(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

function isValidDifficulty(difficulty) {
  return Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 3;
}

function minSum(count) {
  return (count * (count + 1)) / 2;
}

function maxSum(count) {
  return (count * (19 - count)) / 2;
}

function validateCages(cages) {
  if (!Array.isArray(cages) || cages.length === 0) {
    return "Cages are required";
  }

  const seen = new Set();
  for (const cage of cages) {
    if (!Number.isInteger(cage.targetSum) || cage.targetSum < 1) {
      return "Cage target sum must be >= 1";
    }
    if (!Array.isArray(cage.cells) || cage.cells.length === 0) {
      return "Each cage must have at least one cell";
    }
    const count = cage.cells.length;
    if (count > 9) {
      return "Cage cannot contain more than 9 cells";
    }
    if (cage.targetSum < minSum(count) || cage.targetSum > maxSum(count)) {
      return "Cage target sum not achievable for number of cells";
    }

    for (const cell of cage.cells) {
      if (!Number.isInteger(cell.row) || cell.row < 0 || cell.row > 8) {
        return "Cell row must be 0-8";
      }
      if (!Number.isInteger(cell.col) || cell.col < 0 || cell.col > 8) {
        return "Cell col must be 0-8";
      }
      const key = `${cell.row},${cell.col}`;
      if (seen.has(key)) {
        return "Cell already assigned to another cage";
      }
      seen.add(key);
    }
  }

  if (seen.size !== 81) {
    return "All 81 cells must be covered by cages";
  }

  return null;
}

function validateGridValues(grid) {
  if (!Array.isArray(grid) || grid.length !== 9) {
    return "Grid must be 9x9";
  }
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== 9) {
      return "Grid must be 9x9";
    }
    for (const value of row) {
      if (!Number.isInteger(value) || value < 0 || value > 9) {
        return "Cell values must be 0-9";
      }
    }
  }
  return null;
}

function validateSolvedGrid(grid) {
  let sum = 0;
  for (const row of grid) {
    for (const value of row) {
      if (!Number.isInteger(value) || value < 1 || value > 9) {
        return { ok: false, error: "All cells must be 1-9" };
      }
      sum += value;
    }
  }
  if (sum !== 405) {
    return { ok: false, error: "Grid sum must equal 405" };
  }
  return { ok: true };
}

function checkRowsColsBoxes(grid) {
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      rowSet.add(grid[i][j]);
      colSet.add(grid[j][i]);
    }
    if (rowSet.size !== 9 || colSet.size !== 9) return false;
  }

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const boxSet = new Set();
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          boxSet.add(grid[r][c]);
        }
      }
      if (boxSet.size !== 9) return false;
    }
  }

  return true;
}

function checkCages(grid, cages) {
  for (const cage of cages) {
    let sum = 0;
    const seen = new Set();
    for (const cell of cage.cells) {
      const value = grid[cell.row][cell.col];
      if (seen.has(value)) return false;
      seen.add(value);
      sum += value;
    }
    if (sum !== cage.targetSum) return false;
  }
  return true;
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

module.exports = {
  isValidUsername,
  isValidEmail,
  isValidPassword,
  isValidCellValue,
  isValidDifficulty,
  minSum,
  maxSum,
  validateCages,
  validateGridValues,
  validateSolvedGrid,
  checkRowsColsBoxes,
  checkCages,
  isValidRating,
};
