const github = require("../utils/github");

module.exports = async (owner, repo) => {
  try {
    const workflows = await github.get(
      `/repos/${owner}/${repo}/actions/workflows`
    );

    if (workflows.data.total_count === 0) return 0;

    const runs = await github.get(
      `/repos/${owner}/${repo}/actions/runs?per_page=1`
    );

    return runs.data.workflow_runs[0].conclusion === "success" ? 25 : 15;
  } catch {
    return 0;
  }
};
