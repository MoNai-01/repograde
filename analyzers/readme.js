const github = require("../utils/github");

module.exports = async (owner, repo) => {
  try {
    const res = await github.get(`/repos/${owner}/${repo}/readme`);
    const size = Buffer.from(res.data.content, "base64").length;

    if (size > 1024) return 15;
    return 10;
  } catch {
    return 0;
  }
};
