import { log, colors } from "../utils/logger.js";
import { getGitStatus, getGitDiffSummary } from "../utils/git.js";

export function runReview() {
  log.title("📝 clude Pre-flight PR & Review Assistant");

  const git = getGitStatus();
  if (!git.isGit) {
    log.error("Current directory is not a Git repository.");
    return;
  }

  console.log(`${colors.bold}Branch Verification:${colors.reset} ${git.branch}`);
  const isProtectedBranch = ["main", "master", "prod", "production"].includes(git.branch || "");
  if (isProtectedBranch) {
    log.warn(`You are currently on a primary/protected branch: ${git.branch}`);
    console.log(`  ${colors.dim}Consider creating a feature branch before staging changes: git checkout -b feature/your-name${colors.reset}\n`);
  } else {
    log.success(`Feature branch active: ${git.branch}`);
  }

  const diff = getGitDiffSummary();
  if (diff) {
    console.log(`${colors.bold}Changes to be reviewed:${colors.reset}\n${diff}\n`);
  } else {
    log.info("No modified files staged or unstaged.");
  }

  console.log(`${colors.bold}Pre-flight Checklist:${colors.reset}`);
  console.log(` [ ] Code adheres to repository linting & formatting standards`);
  console.log(` [ ] Unit and integration tests pass without warnings`);
  console.log(` [ ] No sensitive credentials, tokens, or .env files staged`);
  console.log(` [ ] Meaningful and concise git commit message formatted`);
  console.log();
}
