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

const marketplace = readJson(".cursor-plugin/marketplace.json");
if (marketplace) {
  if (marketplace.name !== "abletime") {
    fail(".cursor-plugin/marketplace.json name must be abletime");
  }
  if (!marketplace.owner || marketplace.owner.name !== "AbleTime") {
    fail(".cursor-plugin/marketplace.json owner.name must be AbleTime");
  }
  if (marketplace.owner && Object.prototype.hasOwnProperty.call(marketplace.owner, "email")) {
    fail(".cursor-plugin/marketplace.json must not include owner.email");
  }
  const entry = Array.isArray(marketplace.plugins) ? marketplace.plugins[0] : null;
  if (!entry || entry.name !== "abletime" || entry.source !== "plugins/abletime") {
    fail(".cursor-plugin/marketplace.json must list abletime at plugins/abletime");
  }
}

const pluginRoot = "plugins/abletime";
const plugin = readJson(`${pluginRoot}/.cursor-plugin/plugin.json`);
if (plugin) {
  for (const field of ["name", "logo", "license"]) {
    if (plugin[field] == null || plugin[field] === "") {
      fail(`${pluginRoot}/.cursor-plugin/plugin.json missing required field: ${field}`);
    }
  }
  if (!plugin.author || typeof plugin.author !== "object" || !plugin.author.name) {
    fail(`${pluginRoot}/.cursor-plugin/plugin.json missing required field: author.name`);
  }
  if (plugin.author && Object.prototype.hasOwnProperty.call(plugin.author, "email")) {
    fail(`${pluginRoot}/.cursor-plugin/plugin.json must not include author.email`);
  }
  if (plugin.logo) {
    const logoAbs = join(root, pluginRoot, plugin.logo);
    if (!existsSync(logoAbs)) {
      fail(`Logo path does not exist: ${plugin.logo}`);
    }
  }
}

const mcp = readJson(`${pluginRoot}/mcp.json`);
const fullUrl = "https://develop.abletime.com/api/public/v2/mcp/full";
if (mcp) {
  const raw = JSON.stringify(mcp);
  if (!raw.includes(fullUrl)) {
    fail(`mcp.json missing develop full URL: ${fullUrl}`);
  }
  if (Object.keys(mcp.mcpServers || {}).length !== 1) {
    fail("mcp.json must declare exactly one MCP server");
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

const rule = readText(`${pluginRoot}/rules/recording.mdc`);
if (rule !== null) {
  const fmMatch = rule.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    fail("rules/recording.mdc missing YAML frontmatter");
  } else if (!/alwaysApply\s*:\s*true\b/.test(fmMatch[1])) {
    fail("rules/recording.mdc frontmatter missing alwaysApply: true");
  }
}

function checkSkillFrontmatter(relPath) {
  const text = readText(relPath);
  if (text === null) {
    return;
  }
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    fail(`${relPath} missing YAML frontmatter`);
    return;
  }
  const fm = fmMatch[1];
  if (!/^name\s*:/m.test(fm)) {
    fail(`${relPath} frontmatter missing name`);
  }
  if (!/^description\s*:/m.test(fm)) {
    fail(`${relPath} frontmatter missing description`);
  }
}

checkSkillFrontmatter(`${pluginRoot}/skills/record-time/SKILL.md`);
checkSkillFrontmatter(`${pluginRoot}/skills/watch/SKILL.md`);
checkSkillFrontmatter(`${pluginRoot}/skills/intake/SKILL.md`);
checkSkillFrontmatter(`${pluginRoot}/skills/sorting-hat/SKILL.md`);
checkSkillFrontmatter(`${pluginRoot}/skills/bugfix/SKILL.md`);

const watchCommand = readText(`${pluginRoot}/commands/watch.md`);
if (watchCommand !== null) {
  const fmMatch = watchCommand.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    fail("commands/watch.md missing YAML frontmatter");
  } else {
    const fm = fmMatch[1];
    if (!/^name\s*:/m.test(fm)) {
      fail("commands/watch.md frontmatter missing name");
    }
    if (!/^description\s*:/m.test(fm)) {
      fail("commands/watch.md frontmatter missing description");
    }
  }
}

const hooksJson = readJson(`${pluginRoot}/hooks/hooks.json`);
if (hooksJson) {
  if (hooksJson.version !== 1) {
    fail("hooks/hooks.json version must be 1");
  }
  const hooks = hooksJson.hooks ?? {};
  if (!Array.isArray(hooks.sessionStart) || hooks.sessionStart.length === 0) {
    fail("hooks/hooks.json missing sessionStart hook");
  }
  if (!Array.isArray(hooks.stop) || hooks.stop.length === 0) {
    fail("hooks/hooks.json missing stop hook");
  } else {
    const stopEntry = hooks.stop[0];
    if (!stopEntry?.command) {
      fail("hooks/hooks.json stop hook missing command");
    }
    if (!Object.prototype.hasOwnProperty.call(stopEntry, "loop_limit") || stopEntry.loop_limit !== null) {
      fail("hooks/hooks.json stop hook must set loop_limit to null");
    }
  }
  for (const [event, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries) {
      if (entry?.command) {
        const scriptRel = entry.command.replace(/^\.\//, "");
        const scriptAbs = join(root, pluginRoot, scriptRel);
        if (!existsSync(scriptAbs)) {
          fail(`Hook script does not exist: ${pluginRoot}/${scriptRel}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error("validate-plugin failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log("validate-plugin: ok");
