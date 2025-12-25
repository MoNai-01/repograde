const github = require("../utils/github");
const execa = require("execa");

module.exports = async (owner, repo) => {
  try {
    // Download repo zip and extract locally (simplified example)
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const tmpDir = `/tmp/${repo.replace("/", "_")}`;

    const fs = require("fs");
    const path = require("path");
    const { execSync } = require("child_process");

    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });

    execSync(`curl -L ${zipUrl} -o ${tmpDir}/repo.zip`);
    execSync(`unzip -o ${tmpDir}/repo.zip -d ${tmpDir}`);

    const pkgJson = path.join(tmpDir, fs.readdirSync(tmpDir)[0], "package.json");
    if (!fs.existsSync(pkgJson)) return 25; // no JS dependencies, full points

    // Run npm audit
    try {
      const { stdout } = await execa("npm", ["audit", "--json"], { cwd: path.dirname(pkgJson) });
      const audit = JSON.parse(stdout);
      const critical = audit.metadata.vulnerabilities.critical || 0;
      return critical > 0 ? 10 : 25;
    } catch {
      return 10; // error in audit, assume vulnerabilities
    }
  } catch {
    return 25; // if repo not JS, full points
  }
};
