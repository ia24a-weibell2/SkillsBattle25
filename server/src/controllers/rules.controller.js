// Rules controller logic

async function getRules(req, res) {
  return res.json({
    title: "How to Play Killer Sudoku",
    rules: [
      "Fill each row with digits 1-9 exactly once",
      "Fill each column with digits 1-9 exactly once",
      "Fill each 3x3 box with digits 1-9 exactly once",
      "Cage sums must match the target in the corner",
      "No repeated digit inside a cage",
      "Each puzzle has a unique solution",
    ],
  });
}

module.exports = {
  getRules,
};
