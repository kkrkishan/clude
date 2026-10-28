import { execSync } from "node:child_process";

export interface GitRepoStatus {
  isGit: boolean;
  branch?: string;
  uncommittedCount: number;
  untrackedCount: number;
  lastCommit?: string;
  author?: string;
}

export function getGitStatus(): GitRepoStatus {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim();
    const statusOutput = execSync("git status --porcelain", { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim();

    const lines = statusOutput ? statusOutput.split("\n") : [];
    const untrackedCount = lines.filter((l) => l.startsWith("??")).length;
    const uncommittedCount = lines.length - untrackedCount;

    let lastCommit = "";
    let author = "";
    try {
      lastCommit = execSync("git log -1 --pretty=format:%s", { stdio: ["pipe", "pipe", "ignore"] })
        .toString()
        .trim();
      author = execSync("git log -1 --pretty=format:%an", { stdio: ["pipe", "pipe", "ignore"] })
        .toString()
        .trim();
    } catch {
      // empty repo
    }

    return {
      isGit: true,
      branch,
      uncommittedCount,
      untrackedCount,
      lastCommit,
      author,
    };
  } catch {
    return {
      isGit: false,
      uncommittedCount: 0,
      untrackedCount: 0,
    };
  }
}

export function getGitDiffSummary(): string {
  try {
    return execSync("git diff --stat", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}
