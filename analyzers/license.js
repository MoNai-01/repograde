const github = require("../utils/github");

module.exports = async (owner, repo) => {
  try {
    await github.get(`/repos/${owner}/${repo}/license`);
    return 10;
  } catch {
    return 0;
  }
};
