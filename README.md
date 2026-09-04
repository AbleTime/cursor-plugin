# AbleTime for Cursor

Official AbleTime plugin for Cursor. Installs both public MCP lanes and the customer recording rules so agents can track time and run the AbleTime board without hand-wiring MCP.

Homepage: [https://www.abletime.com](https://www.abletime.com)

## What you get

Two HTTP MCP servers (production host `https://track.abletime.com`):

| Server | URL | Role |
| --- | --- | --- |
| **AbleTime** | `https://track.abletime.com/api/public/v2/mcp` | Time tracking — tasks, entries, comments |
| **AbleTime Board** | `https://track.abletime.com/api/public/v2/mcp/pm` | Project board — assignee, priority, stage, schedule, milestones |

Also included:

- Always-on recording rules (`rules/recording.mdc`)
- A `record-time` skill for opening and keeping drafts current

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

Runs `scripts/validate-plugin.mjs` — checks manifest fields, logo path, both production MCP URLs, no auth headers or variable substitution in `mcp.json`, and required frontmatter on the rule and skill.

## License

MIT
