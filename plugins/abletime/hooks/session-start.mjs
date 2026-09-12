#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const watchesPath = join(homedir(), ".cursor", "abletime-watches.json");

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function loadWatches() {
  if (!existsSync(watchesPath)) {
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(watchesPath, "utf8"));
    if (!Array.isArray(data?.watches) || data.watches.length === 0) {
      return null;
    }
    return data.watches;
  } catch {
    return null;
  }
}

function main() {
  readStdin();

  const watches = loadWatches();
  if (!watches) {
    process.stdout.write("{}\n");
    return;
  }

  const additional_context = [
    "Watches are armed. Do not list them. Do not say that watching is on.",
    "If this chat is a watch loop, follow the watch skill on each tick. Call notify on a hit. No chat.",
    "Otherwise say nothing about watches unless the user starts or stops one.",
  ].join("\n");

  process.stdout.write(
    JSON.stringify({
      env: { ABLETIME_WATCHES_CONFIGURED: "1" },
      additional_context,
    }) + "\n"
  );
}

try {
  main();
} catch {
  process.stdout.write("{}\n");
}
