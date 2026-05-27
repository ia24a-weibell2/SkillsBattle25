const { calculateScore } = require("../src/services/scoring");

const cases = [
  { time: 0, hints: 0, expected: 10000 },
  { time: 120, hints: 1, expected: 9380 },
  { time: 9999, hints: 0, expected: 1 },
  { time: 10000, hints: 0, expected: 0 },
  { time: 100, hints: 50, expected: 0 },
];

test.each(cases)("score calculation time=$time hints=$hints", ({ time, hints, expected }) => {
  expect(calculateScore(time, hints)).toBe(expected);
});

