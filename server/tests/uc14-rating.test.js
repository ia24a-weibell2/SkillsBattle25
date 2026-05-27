const { isValidRating } = require("../src/services/validation");

test("UC-14: rating validation", () => {
  expect(isValidRating(1)).toBe(true);
  expect(isValidRating(5)).toBe(true);
  expect(isValidRating(0)).toBe(false);
  expect(isValidRating(6)).toBe(false);
});

