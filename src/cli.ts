import { runAudit } from "./commands/audit.js";
import { runStats } from "./commands/stats.js";
import { runDiff } from "./commands/diff.js";
import { runReview } from "./commands/review.js";
import { colors, log } from "./utils/logger.js";

const VERSION = "0.1.0";

export function printHelp() {
  console.log(`
${colors.bold}${colors.magenta}clude${colors.reset} - Ultra-lightweight Terminal Workflow & Developer Intelligence CLI
${colors.dim}v${VERSION} • Open Source under MIT License${colors.reset}

${colors.bold}USAGE:${colors.reset}
  clude <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.cyan}audit${colors.reset}        Scan repository for secret leaks, missing hygiene files, and TODOs
  ${colors.cyan}stats${colors.reset}        Generate repository code metrics, language breakdown, and volume
  ${colors.cyan}diff${colors.reset}         Quick inspector for pending git diff modifications
  ${colors.cyan}review${colors.reset}       Pre-flight pull request checklist and branch hygiene assistant
  ${colors.cyan}version${colors.reset}      Show current version (${VERSION})
  ${colors.cyan}help${colors.reset}         Display this help menu

${colors.bold}EXAMPLES:${colors.reset}
  $ clude audit
  $ clude stats
  $ clude review
`);
}

export function main(args: string[] = process.argv.slice(2)) {
  const command = (args[0] || "help").toLowerCase();

  switch (command) {
    case "audit":
      runAudit();
      break;
    case "stats":
      runStats();
      break;
    case "diff":
      runDiff();
      break;
    case "review":
      runReview();
      break;
    case "-v":
    case "--version":
    case "version":
      console.log(`clude v${VERSION}`);
      break;
    case "-h":
    case "--help":
    case "help":
    default:
      printHelp();
      break;
  }
}
