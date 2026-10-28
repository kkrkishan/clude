import fs from "node:fs";
import path from "node:path";
import { log, colors } from "../utils/logger.js";
import { getGitStatus } from "../utils/git.js";

interface LangStat {
  files: number;
  lines: number;
}

export function runStats(targetDir: string = process.cwd()) {
  log.title("📊 clude Project Intelligence & Metrics");

  const langMap: Record<string, LangStat> = {};
  let totalFiles = 0;
  let totalLines = 0;

  const extToLang: Record<string, string> = {
    ".ts": "TypeScript",
    ".js": "JavaScript",
    ".json": "JSON",
    ".py": "Python",
    ".rs": "Rust",
    ".go": "Go",
    ".html": "HTML",
    ".css": "CSS",
    ".md": "Markdown",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".sh": "Shell",
    ".cs": "C#",
  };

  function walk(dir: string) {
    const ignoreDirs = new Set([".git", "node_modules", "dist", ".vscode", "coverage", "vendor"]);
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) {
          walk(full);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const lang = extToLang[ext] || "Other";
        if (lang !== "Other") {
          totalFiles++;
          try {
            const content = fs.readFileSync(full, "utf-8");
            const lines = content.split("\n").length;
            totalLines += lines;
            if (!langMap[lang]) langMap[lang] = { files: 0, lines: 0 };
            langMap[lang].files++;
            langMap[lang].lines += lines;
          } catch {
            // ignore
          }
        }
      }
    }
  }

  walk(targetDir);

  const git = getGitStatus();
  console.log(`${colors.bold}Git Context:${colors.reset}`);
  console.log(`• Branch: ${colors.cyan}${git.branch || "N/A"}${colors.reset}`);
  if (git.lastCommit) {
    console.log(`• Recent Commit: "${git.lastCommit}" by ${git.author}`);
  }
  console.log(`• Uncommitted files: ${git.uncommittedCount + git.untrackedCount}`);

  console.log(`\n${colors.bold}Codebase Volume:${colors.reset}`);
  console.log(`• Total Analyzed Files: ${colors.bold}${totalFiles}${colors.reset}`);
  console.log(`• Total Lines of Code: ${colors.bold}${totalLines}${colors.reset}`);

  console.log(`\n${colors.bold}Language Breakdown:${colors.reset}`);
  const sorted = Object.entries(langMap).sort((a, b) => b[1].lines - a[1].lines);
  for (const [lang, stat] of sorted) {
    const pct = totalLines > 0 ? ((stat.lines / totalLines) * 100).toFixed(1) : "0";
    console.log(
      `  ${colors.bold}${lang.padEnd(14)}${colors.reset} ${stat.files.toString().padStart(4)} files   ${stat.lines.toString().padStart(6)} lines  (${pct}%)`
    );
  }
  console.log();
}
