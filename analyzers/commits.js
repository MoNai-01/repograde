const github = require("../utils/github");
const dayjs = require("dayjs");

module.exports = async (owner, repo) => {
  const since = dayjs().subtract(30, "day").toISOString();
  const res = await github.get(
    `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`
  );

  const count = res.data.length;

  if (count >= 20) return 25;
  if (count >= 10) return 20;
  if (count >= 5) return 10;
  return 5;
};
