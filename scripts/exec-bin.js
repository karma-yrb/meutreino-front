#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const [, , command, ...args] = process.argv;

if (!command) {
  console.error(
    "Usage: node ./scripts/exec-bin.js <command> [...args]\nExample: node ./scripts/exec-bin.js npm run test"
  );
  process.exit(1);
}

const isWindows = process.platform === "win32";
const resolvedCommand =
  isWindows && (command === "npm" || command === "npx")
    ? `${command}.cmd`
    : command;

const run = spawnSync(resolvedCommand, args, {
  stdio: "inherit",
  shell: isWindows,
});

if (run.error) {
  if (run.error.code === "ENOENT") {
    console.error(`Command not found: ${resolvedCommand}`);
  } else {
    console.error(run.error.message);
  }
  process.exit(1);
}

process.exit(run.status ?? 1);
