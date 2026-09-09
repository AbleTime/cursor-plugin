#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const cursorDir = join(homedir(), ".cursor");
const loopPath = join(cursorDir, "abletime-watch-loop");
const watchesPath = join(cursorDir, "abletime-watches.json");

function readStdinJson() {
  try {
    const raw = readFileSync(0, "utf8");
    if (!raw.trim()) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function hasWatches() {
  if (!existsSync(watchesPath)) {
    return false;
  }
  try {
    const data = JSON.parse(readFileSync(watchesPath, "utf8"));
    return Array.isArray(data?.watches) && data.watches.length > 0;
  } catch {
    return false;
  }
}

function readIntervalMinutes() {
  if (!existsSync(loopPath)) {
    return 10;
  }
  try {
    const raw = readFileSync(loopPath, "utf8").trim();
    if (!raw) {
      return 10;
    }
    const data = JSON.parse(raw);
    const n = Number(data?.intervalMinutes);
    if (Number.isFinite(n) && n >= 10) {
      return Math.floor(n);
    }
  } catch {
    // empty or non-JSON loop file — default interval
  }
  return 10;
}

function main() {
  const input = readStdinJson();

  if (input.status !== "completed") {
    process.stdout.write("{}\n");
    return;
  }

  if (!existsSync(loopPath) || !hasWatches()) {
    process.stdout.write("{}\n");
    return;
  }

  const minutes = readIntervalMinutes();
  const seconds = minutes * 60;

  const followup_message = [
    "This is an AbleTime watch tick.",
    `Wait ${minutes} minutes (\`sleep ${seconds}\`) unless a longer interval was stored in ~/.cursor/abletime-watch-loop.`,
    "Then run the watch skill: poll watches in ~/.cursor/abletime-watches.json via AbleTime MCP; speak only on a hit; silent empty tick.",
    "If this chat is not an AbleTime watch loop, ignore this message and do not reply.",
  ].join(" ");

  process.stdout.write(JSON.stringify({ followup_message }) + "\n");
}

try {
  main();
} catch {
  process.stdout.write("{}\n");
}
