#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(relPath) {
  const abs = join(root, relPath);
  if (!existsSync(abs)) {
    fail(`Missing file: ${relPath}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch (err) {
    fail(`Invalid JSON in ${relPath}: ${err.message}`);
    return null;
  }
}

function readText(relPath) {
  const abs = join(root, relPath);
  if (!existsSync(abs)) {
    fail(`Missing file: ${relPath}`);
    return null;
  }
  return readFileSync(abs, "utf8");
}

const plugin = readJson(".cursor-plugin/plugin.json");
if (plugin) {
  for (const field of ["name", "logo", "license"]) {
    if (plugin[field] == null || plugin[field] === "") {
      fail(`.cursor-plugin/plugin.json missing required field: ${field}`);
    }
  }
  if (!plugin.author || typeof plugin.author !== "object" || !plugin.author.name) {
    fail(".cursor-plugin/plugin.json missing required field: author.name");
  }
  if (plugin.author && Object.prototype.hasOwnProperty.call(plugin.author, "email")) {
    fail(".cursor-plugin/plugin.json must not include author.email");
  }
  if (plugin.logo) {
    const logoAbs = join(root, plugin.logo);
    if (!existsSync(logoAbs)) {
      fail(`Logo path does not exist: ${plugin.logo}`);
    }
  }
}

const mcp = readJson("mcp.json");
const trackingUrl = "https://app.abletime.com/api/public/v2/mcp";
const boardUrl = "https://app.abletime.com/api/public/v2/mcp/pm";
if (mcp) {
  const raw = JSON.stringify(mcp);
  if (!raw.includes(trackingUrl)) {
    fail(`mcp.json missing production tracking URL: ${trackingUrl}`);
  }
  if (!raw.includes(boardUrl)) {
    fail(`mcp.json missing production board URL: ${boardUrl}`);
  }
  if (/Authorization/i.test(raw)) {
    fail("mcp.json must not contain Authorization");
  }
  if (/Bearer/i.test(raw)) {
    fail("mcp.json must not contain Bearer");
  }
  if (/\bPAT\b/i.test(raw) || /ABLETIME_PAT/i.test(raw)) {
    fail("mcp.json must not contain PAT");
  }
  if (raw.includes("${")) {
    fail("mcp.json must not contain ${} variable substitution");
  }
}

const rule = readText("rules/recording.mdc");
if (rule !== null) {
  const fmMatch = rule.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    fail("rules/recording.mdc missing YAML frontmatter");
  } else if (!/alwaysApply\s*:\s*true\b/.test(fmMatch[1])) {
    fail("rules/recording.mdc frontmatter missing alwaysApply: true");
  }
}

const skill = readText("skills/record-time/SKILL.md");
if (skill !== null) {
  const fmMatch = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    fail("skills/record-time/SKILL.md missing YAML frontmatter");
  } else {
    const fm = fmMatch[1];
    if (!/^name\s*:/m.test(fm)) {
      fail("skills/record-time/SKILL.md frontmatter missing name");
    }
    if (!/^description\s*:/m.test(fm)) {
      fail("skills/record-time/SKILL.md frontmatter missing description");
    }
  }
}

if (errors.length) {
  console.error("validate-plugin failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log("validate-plugin: ok");
