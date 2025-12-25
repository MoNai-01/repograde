const github = require("../utils/github");

module.exports = async (owner, repo) => {
  const res = await github.get(`/repos/${owner}/${repo}`);
  const open = res.data.open_issues_count;

  if (open === 0) return 15;
  if (open < 20) return 10;
  return 5;
};
