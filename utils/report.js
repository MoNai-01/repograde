const chalk = require("chalk").default;

module.exports = (repo, scores, final) => {
  console.log(chalk.bold("\nRepository Health Report"));
  console.log("------------------------");
  console.log(`Repository: ${repo}\n`);
  console.log(`README:        ${scores.readme} / 15`);
  console.log(`License:       ${scores.license} / 10`);
  console.log(`Issues:        ${scores.issues} / 15`);
  console.log(`Commits:       ${scores.commits} / 25`);
  console.log(`CI:            ${scores.ci} / 25`);
  console.log(`Secrets:       ${scores.secrets} /15`);
  console.log(`Dependencies:  ${scores.dependencies} /25`);
  console.log(`Quality:       ${scores.quality} /25`);
  console.log("------------------------");
  console.log(`TOTAL SCORE:   ${chalk.bold(final.total)} / 100`);
  console.log(`GRADE:         ${chalk.bold(final.grade)}`);
};

