const maxPoints = {
  readme: 10,
  license: 10,
  issues: 10,
  commits: 15,
  ci: 15,
  secrets: 10,
  dependencies: 15,
  quality: 15
};

module.exports = function calculateScore(scores) {
  let total = 0;

  for (const key in scores) {
    const raw = scores[key];
    total += Math.min(raw, maxPoints[key]); // cap at new max
  }

  let grade = "F";
  if (total >= 90) grade = "A";
  else if (total >= 75) grade = "B";
  else if (total >= 60) grade = "C";
  else if (total >= 50) grade = "D";

  return { total, grade };
};

