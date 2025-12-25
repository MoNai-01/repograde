const github = require("../utils/github");
const execa = require("execa");
const fs = require("fs");
const path = require("path");

module.exports = async (owner, repo) => {
  try {
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const tmpDir = `/tmp/${repo.replace("/", "_")}`;

    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    const { execSync } = require("child_process");
    execSync(`curl -L ${zipUrl} -o ${tmpDir}/repo.zip`);
    execSync(`unzip -o ${tmpDir}/repo.zip -d ${tmpDir}`);

    const repoDir = path.join(tmpDir, fs.readdirSync(tmpDir)[0]);
    if (!fs.existsSync(path.join(repoDir, "package.json"))) return 25; // no JS code

    // Run ESLint
    try {
      const { stdout } = await execa("npx", ["eslint", ".", "--max-warnings=0"], { cwd: repoDir });
      return 25; // no errors
    } catch (err) {
      return 15; // lint errors
    }
  } catch {
    return 25; // fallback
  }
};
