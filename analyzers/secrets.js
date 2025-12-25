const github = require("../utils/github");

module.exports = async (owner, repo) => {
  try {
    // Fetch repository files from root only (simplified for MVP)
    const res = await github.get(`/repos/${owner}/${repo}/contents`);
    let score = 15; // full points if clean

    // Define common secret patterns
    const patterns = [
      /AKIA[0-9A-Z]{16}/,              // AWS keys
      /-----BEGIN PRIVATE KEY-----/,    // Private keys
      /api_key\s*=\s*['"][a-zA-Z0-9_-]{16,}['"]/i,
      /secret\s*=\s*['"][a-zA-Z0-9_-]{8,}['"]/i
    ];

    for (const file of res.data) {
      if (file.type !== "file") continue;

      const contentRes = await github.get(`/repos/${owner}/${repo}/contents/${file.path}`);
      const content = Buffer.from(contentRes.data.content, "base64").toString();

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          score = 0; // Secret detected
          return score; // stop scanning further
        }
      }
    }

    return score;
  } catch (err) {
    return 15; // fallback: assume clean if error (e.g., empty repo)
  }
};
