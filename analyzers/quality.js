const github = require("../utils/github");
const fs = require("fs");
const path = require("path");
const os = require("os");
const execa = require("execa");
const { downloadFile, extractZip } = require("../utils/download");

function getTempDir(repoName) {
  return path.join(os.tmpdir(), repoName.replace("/", "_") + "_quality");
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

    const repoDir = path.join(tmpDir, extractedDir);
    const pkgJson = path.join(repoDir, "package.json");
    if (!fs.existsSync(pkgJson)) return 5;

    const eslintConfigs = [
      ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml",
      "eslint.config.js", "eslint.config.mjs"
    ];
    const hasEslintConfig = eslintConfigs.some(c => fs.existsSync(path.join(repoDir, c)));
    if (!hasEslintConfig) return 5;

    try {
      const result = await execa("npx", ["eslint", ".", "--max-warnings=0", "--format=json"], { cwd: repoDir, timeout: 60000, reject: false });
      const output = result.stdout || "";
      if (!output.trim()) return 10;
      const eslintResults = JSON.parse(output);
      const errors = eslintResults.reduce((sum, f) => sum + (f.errorCount || 0), 0);
      const warnings = eslintResults.reduce((sum, f) => sum + (f.warningCount || 0), 0);
      let score = 10;
      if (errors > 0) score -= Math.min(errors * 0.5, 5);
      if (warnings > 10) score -= Math.min((warnings - 10) * 0.1, 2);
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
 
