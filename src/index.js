#!/usr/bin/env node

const displayBanner = require("../utils/banner");
displayBanner();

const { program } = require("commander");
const readme = require("../analyzers/readme");
const license = require("../analyzers/license");
const issues = require("../analyzers/issues");
const commits = require("../analyzers/commits");
const ci = require("../analyzers/ci");
const score = require("../scoring/score");
const report = require("../utils/report");
const secrets = require("../analyzers/secrets");
const dependencies = require("../analyzers/dependencies");
const quality = require("../analyzers/quality");

program
  .name("repograde")
  .description("CLI tool to check GitHub repository health")
  .argument("<repos...>", "Repository names in owner/repo format (e.g., facebook/react)")
  .option("-j, --json", "Output the repository health report in JSON format")
  .option("-c, --csv", "Output the repository health report in CSV format")
  .option("-v, --verbose", "Enable verbose mode to show detailed processing steps", true)
  .option("-b, --badge", "Generate a Markdown badge for the repository health")
  .helpOption("-h, --help", "Display this help message with all CLI features")
  .addHelpText("afterAll", `
Examples:
  $ repograde facebook/react
  $ repograde facebook/react axios/axios -j
  $ repograde owner/repo -c -b

CLI Features & Usability:
  - Analyze multiple repositories at once by listing them separated by spaces
  - Output formats: JSON, CSV, or default terminal report
  - Badge generation: create a Markdown badge for README usage
  - Verbose mode: shows detailed step-by-step analysis in terminal
  - Handles errors gracefully: missing repos, invalid format, or API limits
  - Friendly messages: clear guidance for incorrect repo/user inputs
`)
  .exitOverride((err) => {
    if (err.code === "commander.missingArgument") {
      console.error("No repositories specified. Please provide one or more in owner/repo format.\n");
      program.help({ error: true });
    }
  })
  .parse(process.argv);


const options = program.opts();
const repos = program.args;

if (!repos.length) {
  console.error("Please specify at least one repository: owner/repo");
  process.exit(1);
}

(async () => {
  for (const repo of repos) {
    if (!repo.includes("/")) {
      console.error(`Invalid repo format: ${repo}. Use owner/repo`);
      continue;
    }

    const [owner, name] = repo.split("/");

    try {
      if (options.verbose) console.log(`Analyzing ${repo}...`);

      const scores = {
        readme: await readme(owner, name),
        license: await license(owner, name),
        issues: await issues(owner, name),
        commits: await commits(owner, name),
        ci: await ci(owner, name),
        secrets: await secrets(owner, name),
        dependencies: await dependencies(owner, name),
        quality: await quality(owner, name)
      };

      const final = score(scores);

      // Output formats
      if (options.json) {
        console.log(JSON.stringify({ repo, scores, total: final.total, grade: final.grade }, null, 2));
      } else if (options.csv) {
        const { Parser } = require("json2csv");
        const parser = new Parser({ fields: ["repo", "readme", "license", "issues", "commits", "ci", "total", "grade"] });
        const csv = parser.parse({ 
          repo, 
          readme: scores.readme, 
          license: scores.license, 
          issues: scores.issues, 
          commits: scores.commits, 
          ci: scores.ci, 
          total: final.total, 
          grade: final.grade 
        });
        console.log(csv);
      } else {
        // Default terminal report
        report(repo, scores, final);

        // Badge generation
        if (options.badge) {
          const badgeColor = final.total >= 75 ? "brightgreen" : final.total >= 50 ? "yellow" : "red";
          console.log(`\nMarkdown Badge:\n![Repo Health](https://img.shields.io/badge/Health-${final.grade}%20${final.total}/100-${badgeColor})\n`);
        }
      }
    } catch (err) {
      // Friendly error handling
      console.error(`Error analyzing ${repo}: ${err.message}`);
      if (options.verbose) console.error(err.stack);
    }
  }
})();
 
