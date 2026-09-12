# AbleTime for Cursor

Official AbleTime plugin for Cursor. Installs one MCP and the customer recording rules so agents can track time and run the board without hand-wiring MCP.

Homepage: [https://www.abletime.com](https://www.abletime.com)

## What you get

One HTTP MCP server (develop host `https://develop.abletime.com` until release):

| Server | URL | Role |
| --- | --- | --- |
| **AbleTime** | `https://develop.abletime.com/api/public/v2/mcp/full` | Every AbleTime tool |

Also included:

- Always-on recording rules (`rules/recording.mdc`)
- A `record-time` skill for opening and keeping drafts current
- A `watch` skill and `/watch` command — poll for tasks assigned to you or landing in a named stage (10-minute floor; `notify` on hits, not chat)
- `intake`, `sorting-hat`, and `bugfix` skills (file and name the source, sort, fix and open a PR; `notify` after each)
- `sessionStart` and `stop` hooks that inject watch context and re-arm the watch loop

Watches persist in `~/.cursor/abletime-watches.json` (user-local, not in the repo).

## Auth (Cursor)

Cursor authenticates with **OAuth**. AbleTime answers unauthenticated MCP calls with a 401 that includes protected-resource metadata; Cursor completes OAuth from that challenge.

Do **not** put a PAT or `Authorization` header in `mcp.json`. A personal access token is an AbleTime credential for other clients (scripts, non-Cursor tools). It is not the Cursor install path.

## Install

This repo is a Cursor team marketplace (`/.cursor-plugin/marketplace.json`) with one plugin at `plugins/abletime`.

**Import Marketplace** (Customize → Import): paste `https://github.com/AbleTime/cursor-plugin`. Cursor must be able to read the AbleTime GitHub org (Cursor GitHub App installed on that org). Then enable AbleTime.

**Local testing:** Cursor rejects a symlink whose target is outside `~/.cursor/plugins/local`. Copy the plugin directory in:

```bash
git clone https://github.com/AbleTime/cursor-plugin.git
mkdir -p ~/.cursor/plugins/local
rsync -a cursor-plugin/plugins/abletime/ ~/.cursor/plugins/local/abletime/
```

Reload (**Developer: Reload Window**). Enable AbleTime under **Customize**.

## Validate

```bash
npm test
```

Runs `scripts/validate-plugin.mjs` — checks manifest fields, logo path, the one develop MCP URL, no auth headers or variable substitution in `mcp.json`, required frontmatter on rules/skills/commands, and hook wiring.

## License

MIT
