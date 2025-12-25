const figlet = require("figlet");
const chalk = require("chalk").default;

module.exports = function displayBanner() {
  const bannerText = figlet.textSync("RepoGrade", {
    font: "Slant",       // Good-looking font, you can experiment: "Standard", "Big", "Slant"
    horizontalLayout: "default",
    verticalLayout: "default"
  });

  console.log(chalk.cyan.bold(bannerText));
  console.log(chalk.yellow("CLI Tool to Check GitHub Repository Health\n"));
};
