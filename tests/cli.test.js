import { test, describe } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binPath = path.resolve(__dirname, "../bin/clude.js");

describe("clude CLI integration tests", () => {
  test("prints version correctly", () => {
    const output = execSync(`node "${binPath}" --version`).toString();
    assert.match(output, /clude v0\.1\.0/);
  });

  test("prints help message correctly", () => {
    const output = execSync(`node "${binPath}" --help`).toString();
    assert.match(output, /Ultra-lightweight Terminal Workflow/);
    assert.match(output, /COMMANDS:/);
  });

  test("runs stats command without crashing", () => {
    const output = execSync(`node "${binPath}" stats`).toString();
    assert.match(output, /Project Intelligence & Metrics/);
    assert.match(output, /Codebase Volume/);
  });

  test("runs audit command and detects hygiene files", () => {
    const output = execSync(`node "${binPath}" audit`).toString();
    assert.match(output, /⚡ clude Repository Audit/);
    assert.match(output, /Audit Summary/);
  });
});
