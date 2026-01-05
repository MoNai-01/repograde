const github = require("../utils/github");
const execa = require("execa");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { downloadFile, extractZip } = require("../utils/download");

function getTempDir(repoName) {
  return path.join(os.tmpdir(), repoName.replace("/", "_"));
}

function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function ensureTempDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

module.exports = async (owner, repo, githubToken = null) => {
  const tmpDir = getTempDir(`${owner}_${repo}`);
  
  try {
    const repoInfo = await github.get(`/repos/${owner}/${repo}`, {}, githubToken);
    const defaultBranch = repoInfo.data.default_branch || "main";
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`;

    cleanupTempDir(tmpDir);
    ensureTempDir(tmpDir);

    const zipPath = path.join(tmpDir, "repo.zip");
    await downloadFile(zipUrl, zipPath);
    await extractZip(zipPath, tmpDir);

    const extractedDir = fs.readdirSync(tmpDir).find(f => fs.statSync(path.join(tmpDir, f)).isDirectory());
    if (!extractedDir) return 0;

    const pkgJson = path.join(tmpDir, extractedDir, "package.json");
    if (!fs.existsSync(pkgJson)) return 25;

    try {
      const { stdout } = await execa("npm", ["audit", "--json"], { cwd: path.dirname(pkgJson), reject: false, timeout: 30000 });
      const audit = JSON.parse(stdout);
      const vulns = audit.metadata?.vulnerabilities || {};
      let score = 10;
      if ((vulns.critical || 0) > 0) score -= 5;
      else if ((vulns.high || 0) >= 5) score -= 3;
      else if ((vulns.high || 0) >= 2) score -= 2;
      return Math.max(Math.round(score), 0);
    } catch {
      return 5;
    }
  } catch {
    return 0;
  } finally {
    cleanupTempDir(tmpDir);
  }
};
 
