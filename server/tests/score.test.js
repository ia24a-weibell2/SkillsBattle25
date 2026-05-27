const { calculateScore } = require("../src/services/scoring");

const cases = [
  { time: 0,     hints: 0,   expected: 10000 }, // TC10-B1: max possible score
  { time: 50,    hints: 0,   expected: 9950  }, // TC10-P2: no hints, 50 s
  { time: 120,   hints: 1,   expected: 9380  }, // TC10-P1: typical solve
  { time: 9500,  hints: 1,   expected: 0     }, // TC10-B2: floor at 0
  { time: 9999,  hints: 0,   expected: 1     },
  { time: 10000, hints: 0,   expected: 0     },
  { time: 100,   hints: 50,  expected: 0     },
  { time: 99999, hints: 999, expected: 0     }, // TC10-B3: never negative
];

test.each(cases)("score calculation time=$time hints=$hints", ({ time, hints, expected }) => {
  expect(calculateScore(time, hints)).toBe(expected);
});

