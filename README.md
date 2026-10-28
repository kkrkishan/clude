# clude ⚡

> **Ultra-lightweight Terminal Workflow & Developer Intelligence CLI**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kkrkishan/clude/pulls)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js)](package.json)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/kkrkishan/clude/graphs/commit-activity)

**clude** is a fast, zero-bloat command-line developer utility designed to streamline modern engineering workflows, audit repositories for sensitive leaks, analyze codebase metrics, and assist with pre-flight pull request reviews directly from your shell.

---

## 🎯 Why clude?

Existing developer tooling and AI terminal wrappers are frequently heavy, bundled with hundreds of megabytes of third-party dependencies, or tied to proprietary SaaS backends. 

**clude** is built with zero runtime dependencies:
- ⚡ **Instant Execution:** Starts in milliseconds using native runtime APIs.
- 🔒 **Local & Private:** Scans and audits files purely on your local machine with zero telemetry.
- 🛠️ **Developer Hygiene:** Catches accidental API key leaks, missing documentation, and lingering TODOs before you commit.
- 📊 **Code Intelligence:** Instant breakdown of codebase volume, language metrics, and git health.

---

## 🚀 Quick Start

### Installation

Clone and install globally:
```bash
git clone https://github.com/kkrkishan/clude.git
cd clude
npm install -g .
```

Or run directly without installing:
```bash
node ./bin/clude.js --help
```

---

## 💻 Commands & Capabilities

### 1. Repository Audit (`clude audit`)
Scans the current workspace for sensitive token patterns, checks for required documentation files (`README.md`, `.gitignore`), and tallies actionable developer items.

```bash
$ clude audit

⚡ clude Repository Audit

Audit Summary:
• Files Scanned: 42
• Actionable TODOs found: 3

Passed Checks (3):
✔ Git repository active on branch 'main'
✔ README documentation found
✔ .gitignore file configured
```

### 2. Codebase Intelligence (`clude stats`)
Analyzes all files in your repository, calculating line volume, file breakdown, and language distribution alongside recent git commit context.

```bash
$ clude stats

📊 clude Project Intelligence & Metrics
Git Context:
• Branch: main
• Recent Commit: "feat: core execution engine" by kkrkishan

Codebase Volume:
• Total Analyzed Files: 12
• Total Lines of Code: 1,420

Language Breakdown:
  TypeScript         8 files      980 lines  (69.0%)
  JSON               2 files      240 lines  (16.9%)
  Markdown           2 files      200 lines  (14.1%)
```

### 3. Pre-flight Review Assistant (`clude review`)
Runs a pre-flight checklist before staging changes to ensure feature-branch safety, clean git diffs, and formatting compliance.

```bash
$ clude review

📝 clude Pre-flight PR & Review Assistant
Current Branch: feature/auth-provider
✔ Feature branch active: feature/auth-provider

Pre-flight Checklist:
 [ ] Code adheres to repository formatting standards
 [ ] Unit and integration tests pass without warnings
 [ ] No sensitive credentials, tokens, or .env files staged
 [ ] Concise, conventional git commit message prepared
```

---

## 🧪 Running Tests

`clude` includes automated tests using Node's native test runner:

```bash
npm test
```

Tested across Linux, macOS, and Windows via GitHub Actions CI.

---

## 🗺️ Roadmap

- [x] Core CLI engine with zero runtime dependencies
- [x] Local repository security and hygiene audit
- [x] Codebase metrics and language distribution calculator
- [x] Pre-flight pull request verification assistant
- [x] Cross-platform GitHub Actions CI matrix
- [ ] Terminal shell completions (Bash, Zsh, PowerShell)
- [ ] Integration with automated AI code-review agents (Claude Code)
- [ ] Exportable audit reports (JSON / Markdown)

---

## 🤝 Contributing

Contributions are warmly welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on creating pull requests and reporting issues.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

Maintained with ❤️ by [Kishan Khatrani](https://github.com/kkrkishan).
