import fs from "node:fs";
import path from "node:path";
import { log, colors } from "../utils/logger.js";
import { getGitStatus } from "../utils/git.js";

const SECRET_PATTERNS = [
  { name: "Anthropic/OpenAI API Key", regex: /sk-[a-zA-Z0-9_-]{20,}/i },
  { name: "Generic Secret Key", regex: /(?:secret|password|token|access_key)["'\s]*[:=]["'\s]*[a-zA-Z0-9_\-\+]{8,}/i },
  { name: "Private RSA/SSH Key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS Access Key", regex: /(?:AKIA|ASIA)[0-9A-Z]{16}/ },
];

export interface AuditReport {
  warnings: string[];
  passed: string[];
  todoCount: number;
  filesScanned: number;
}

export function runAudit(targetDir: string = process.cwd()): AuditReport {
  log.title("⚡ clude Repository Audit");

  const report: AuditReport = {
    warnings: [],
    passed: [],
    todoCount: 0,
    filesScanned: 0,
  };

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

  // Check critical files
  const readmeExists = ["README.md", "readme.md", "README"].some((f) =>
    fs.existsSync(path.join(targetDir, f))
  );
  if (readmeExists) {
    report.passed.push("README documentation found");
  } else {
    report.warnings.push("Missing README.md file");
  }

  const gitignoreExists = fs.existsSync(path.join(targetDir, ".gitignore"));
  if (gitignoreExists) {
    report.passed.push(".gitignore file configured");
  } else {
    report.warnings.push("Missing .gitignore file");
  }

  // Walk directory for sensitive leaks
  scanDirectory(targetDir, targetDir, report);

  // Print results
  console.log(`${colors.bold}Audit Summary:${colors.reset}`);
  console.log(`• Files Scanned: ${report.filesScanned}`);
  console.log(`• Actionable TODOs found: ${report.todoCount}`);

  console.log(`\n${colors.bold}${colors.green}Passed Checks (${report.passed.length}):${colors.reset}`);
  for (const p of report.passed) {
    log.success(p);
  }

  if (report.warnings.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}Warnings / Observations (${report.warnings.length}):${colors.reset}`);
    for (const w of report.warnings) {
      log.warn(w);
    }
  } else {
    console.log(`\n${colors.bold}${colors.green}✔ No critical issues detected! Perfect state.${colors.reset}`);
  }

  return report;
}

function scanDirectory(dir: string, baseDir: string, report: AuditReport) {
  const ignoreDirs = new Set([".git", "node_modules", "dist", ".idea", ".vscode", "coverage", "vendor"]);
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        scanDirectory(fullPath, baseDir, report);
      }
    } else if (entry.isFile()) {
      report.filesScanned++;
      checkFileContent(fullPath, baseDir, report);
    }
  }
}

function checkFileContent(filePath: string, baseDir: string, report: AuditReport) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 2 * 1024 * 1024) {
      const rel = path.relative(baseDir, filePath);
      report.warnings.push(`Large file detected: ${rel} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const textExts = new Set([".ts", ".js", ".json", ".md", ".py", ".rs", ".go", ".c", ".cpp", ".cs", ".txt", ".env", ".yaml", ".yml", ".toml"]);
    if (!textExts.has(ext) && ext !== "") return;

    const content = fs.readFileSync(filePath, "utf-8");
    const rel = path.relative(baseDir, filePath);

    // Scan for secrets
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        report.warnings.push(`Potential secret leak [${pattern.name}] in ${rel}`);
      }
    }

    // Count TODOs
    const todos = content.match(/\b(TODO|FIXME|HACK)\b/g);
    if (todos) {
      report.todoCount += todos.length;
    }
  } catch {
    // skip non-readable
  }
}
