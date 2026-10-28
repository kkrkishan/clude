import { log, colors } from "../utils/logger.js";
import { getGitDiffSummary, getGitStatus } from "../utils/git.js";

export function runDiff() {
  log.title("🔍 clude Git Diff Inspector");
  const git = getGitStatus();
  if (!git.isGit) {
    log.error("Not a git repository.");
    return;
  }

  const stat = getGitDiffSummary();
  if (!stat) {
    log.info("No uncommitted changes in current working tree.");
    return;
  }

  console.log(`${colors.bold}Pending Modifications:${colors.reset}\n`);
  console.log(stat);
  console.log(`\n${colors.dim}Run 'git diff' to view line-by-line differences.${colors.reset}\n`);
}
