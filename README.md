# RepoGrade

RepoGrade is a CLI tool that evaluates the health of GitHub repositories by analyzing
documentation, activity, CI, security, dependencies, and code quality.

## Features
- Repository health scoring (0–100)
- Grade system (A–F)
- README, license, CI, commits, issues analysis
- Dependency and security checks
- JSON, CSV, and terminal output
- Markdown badge generation
- Graceful error handling

## Installation
````
git clone https://github.com/MoNai-01/repograde.git
cd repograde
npm run setup
````
## Usage
```
repograde owner/repo
repograde MoNai-01/repograde
repograde MoNai-01/repograde --json
repograde MoNai-01/repograde --badge
```
## Help menu
```
repograde
repograde --help
```
## Example 
```
repograde MoNai-01/repograde
    ____                   ______               __
   / __ \___  ____  ____  / ____/________ _____/ /__
  / /_/ / _ \/ __ \/ __ \/ / __/ ___/ __ `/ __  / _ \
 / _, _/  __/ /_/ / /_/ / /_/ / /  / /_/ / /_/ /  __/
/_/ |_|\___/ .___/\____/\____/_/   \__,_/\__,_/\___/
          /_/
CLI Tool to Check GitHub Repository Health

Analyzing MoNai-01/repograde...

Repository Health Report
------------------------
Repository: MoNai-01/repograde

README:        15 / 15
License:       10 / 10
Issues:        15 / 15
Commits:       20 / 25
CI:            0 / 25
Secrets:       15 /15
Dependencies:  5 /25
Quality:       5 /25
------------------------
TOTAL SCORE:   65 / 100
GRADE:         C
```
