const github = require("../utils/github");
const axios = require("axios");
let semver;
try { semver = require("semver"); } catch { semver = null; }

module.exports = async (owner, repo, githubToken = null) => {
  try {
    const pkg = await github.get(`/repos/${owner}/${repo}/contents/package.json`, {}, githubToken);
    const content = Buffer.from(pkg.data.content, "base64").toString();
    const json = JSON.parse(content);

    const deps = { ...json.dependencies, ...json.devDependencies };
    if (!deps || Object.keys(deps).length === 0) return 5;

    const depNames = Object.keys(deps).slice(0, 15);
    let outdated = 0, checked = 0;

    for (const dep of depNames) {
      try {
        const installedVersion = deps[dep].replace(/[\^~>=<]/g, "").trim();
        const npm = await axios.get(`https://registry.npmjs.org/${dep}/latest`, { timeout: 5000 });
        if (!npm.data.version) continue;
        checked++;
        const latestVersion = npm.data.version;
        if (semver && semver.valid(installedVersion) && semver.valid(latestVersion)) {
          if (semver.lt(installedVersion, latestVersion)) {
            const installedMajor = semver.major(installedVersion);
            const latestMajor = semver.major(latestVersion);
            outdated += latestMajor > installedMajor ? 2 : 1;
          }
        } else if (installedVersion !== latestVersion) outdated += 1;
      } catch { continue; }
    }

    if (checked === 0) return 5;
    const freshness = ((checked - outdated) / checked) * 5;
    return Math.max(Math.round(freshness), 0);
  } catch {
    return 0;
  }
};
