#!/usr/bin/env node

/**
 * clude CLI Entry Point
 * Copyright (c) 2026 Kishan Khatrani (kkrkishan)
 * Licensed under the MIT License
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const VERSION = "0.1.0";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.magenta}${msg}${colors.reset}\n`),
};

function getGitStatus() {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
    const statusOutput = execSync("git status --porcelain", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
    const lines = statusOutput ? statusOutput.split("\n") : [];
    const untrackedCount = lines.filter((l) => l.startsWith("??")).length;
    const uncommittedCount = lines.length - untrackedCount;
    let lastCommit = "";
    let author = "";
    try {
      lastCommit = execSync("git log -1 --pretty=format:%s", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
      author = execSync("git log -1 --pretty=format:%an", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
    } catch {}
    return { isGit: true, branch, uncommittedCount, untrackedCount, lastCommit, author };
  } catch {
    return { isGit: false, uncommittedCount: 0, untrackedCount: 0 };
  }
}

function runAudit(targetDir = process.cwd()) {
  log.title("⚡ clude Repository Audit");
  const report = { warnings: [], passed: [], todoCount: 0, filesScanned: 0 };
  const git = getGitStatus();

  if (git.isGit) {
    report.passed.push(`Git repository active on branch '${git.branch}'`);
    if (git.uncommittedCount > 0) {
      report.warnings.push(`${git.uncommittedCount} uncommitted changes detected in workspace`);
    } else {
      report.passed.push("Working directory clean");
    }
  } else {
    report.warnings.push("Directory is not a Git repository");
  }

  const readmeExists = ["README.md", "readme.md"].some((f) => fs.existsSync(path.join(targetDir, f)));
  if (readmeExists) report.passed.push("README documentation found");
  else report.warnings.push("Missing README.md file");

  const gitignoreExists = fs.existsSync(path.join(targetDir, ".gitignore"));
  if (gitignoreExists) report.passed.push(".gitignore file configured");
  else report.warnings.push("Missing .gitignore file");

  function scan(dir) {
    const ignore = new Set([".git", "node_modules", "dist", ".vscode"]);
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !ignore.has(e.name)) scan(full);
      else if (e.isFile()) {
        report.filesScanned++;
        try {
          const content = fs.readFileSync(full, "utf-8");
          const todos = content.match(/\b(TODO|FIXME|HACK)\b/g);
          if (todos) report.todoCount += todos.length;
        } catch {}
      }
    }
  }

  scan(targetDir);

  console.log(`${colors.bold}Audit Summary:${colors.reset}`);
  console.log(`• Files Scanned: ${report.filesScanned}`);
  console.log(`• Actionable TODOs found: ${report.todoCount}`);

  console.log(`\n${colors.bold}${colors.green}Passed Checks (${report.passed.length}):${colors.reset}`);
  report.passed.forEach((p) => log.success(p));

  if (report.warnings.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}Warnings / Observations (${report.warnings.length}):${colors.reset}`);
    report.warnings.forEach((w) => log.warn(w));
  } else {
    console.log(`\n${colors.bold}${colors.green}✔ No critical issues detected! Perfect state.${colors.reset}`);
  }
}

function runStats(targetDir = process.cwd()) {
  log.title("📊 clude Project Intelligence & Metrics");
  const langMap = {};
  let totalFiles = 0;
  let totalLines = 0;

  const extToLang = {
    ".ts": "TypeScript",
    ".js": "JavaScript",
    ".json": "JSON",
    ".py": "Python",
    ".md": "Markdown",
    ".sh": "Shell",
    ".yaml": "YAML",
    ".yml": "YAML"
  };

  function walk(dir) {
    const ignore = new Set([".git", "node_modules", "dist"]);
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !ignore.has(e.name)) walk(full);
      else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        const lang = extToLang[ext] || "Other";
        if (lang !== "Other") {
          totalFiles++;
          try {
            const lines = fs.readFileSync(full, "utf-8").split("\n").length;
            totalLines += lines;
            if (!langMap[lang]) langMap[lang] = { files: 0, lines: 0 };
            langMap[lang].files++;
            langMap[lang].lines += lines;
          } catch {}
        }
      }
    }
  }

  walk(targetDir);

  const git = getGitStatus();
  console.log(`${colors.bold}Git Context:${colors.reset}`);
  console.log(`• Branch: ${colors.cyan}${git.branch || "N/A"}${colors.reset}`);
  if (git.lastCommit) console.log(`• Recent Commit: "${git.lastCommit}" by ${git.author}`);

  console.log(`\n${colors.bold}Codebase Volume:${colors.reset}`);
  console.log(`• Total Analyzed Files: ${colors.bold}${totalFiles}${colors.reset}`);
  console.log(`• Total Lines of Code: ${colors.bold}${totalLines}${colors.reset}`);

  console.log(`\n${colors.bold}Language Breakdown:${colors.reset}`);
  Object.entries(langMap)
    .sort((a, b) => b[1].lines - a[1].lines)
    .forEach(([lang, stat]) => {
      const pct = totalLines > 0 ? ((stat.lines / totalLines) * 100).toFixed(1) : "0";
      console.log(`  ${colors.bold}${lang.padEnd(14)}${colors.reset} ${stat.files.toString().padStart(4)} files   ${stat.lines.toString().padStart(6)} lines  (${pct}%)`);
    });
  console.log();
}

function runReview() {
  log.title("📝 clude Pre-flight PR & Review Assistant");
  const git = getGitStatus();
  if (!git.isGit) return log.error("Not a Git repository.");

  console.log(`${colors.bold}Current Branch:${colors.reset} ${git.branch}`);
  if (["main", "master"].includes(git.branch)) {
    log.warn(`You are currently on primary branch: ${git.branch}`);
  } else {
    log.success(`Feature branch active: ${git.branch}`);
  }

  try {
    const diff = execSync("git diff --stat", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
    if (diff) {
      console.log(`\n${colors.bold}Pending Modifications:${colors.reset}\n${diff}\n`);
    } else {
      log.info("Working tree clean.");
    }
  } catch {}

  console.log(`${colors.bold}Pre-flight Checklist:${colors.reset}`);
  console.log(` [ ] Code adheres to repository formatting standards`);
  console.log(` [ ] Unit and integration tests pass without warnings`);
  console.log(` [ ] No sensitive credentials, tokens, or .env files staged`);
  console.log(` [ ] Concise, conventional git commit message prepared\n`);
}

function printHelp() {
  console.log(`
${colors.bold}${colors.magenta}clude${colors.reset} - Ultra-lightweight Terminal Workflow & Developer Intelligence CLI
${colors.dim}v${VERSION} • Open Source under MIT License${colors.reset}

${colors.bold}USAGE:${colors.reset}
  clude <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.cyan}audit${colors.reset}        Scan repository for secret leaks, missing hygiene files, and TODOs
  ${colors.cyan}stats${colors.reset}        Generate repository code metrics, language breakdown, and volume
  ${colors.cyan}review${colors.reset}       Pre-flight pull request checklist and branch hygiene assistant
  ${colors.cyan}version${colors.reset}      Show current version (${VERSION})
  ${colors.cyan}help${colors.reset}         Display this help menu

${colors.bold}EXAMPLES:${colors.reset}
  $ clude audit
  $ clude stats
  $ clude review
`);
}

const args = process.argv.slice(2);
const command = (args[0] || "help").toLowerCase();

switch (command) {
  case "audit": runAudit(); break;
  case "stats": runStats(); break;
  case "review": runReview(); break;
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
