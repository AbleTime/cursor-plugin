# AbleTime for Cursor

Official AbleTime plugin for Cursor. Installs one MCP server and the customer recording rules so agents can track time, run the board, and read reports without hand-wiring MCP.

Homepage: [https://www.abletime.com](https://www.abletime.com)

## What you get

One HTTP MCP server on `https://track.abletime.com`:

| Server | URL | Role |
| --- | --- | --- |
| **AbleTime** | `https://track.abletime.com/api/public/v2/mcp/plugins` | Time, the board, and reports |

Also included:

- Always-on recording rules (`rules/recording.mdc`)
- A `record-time` skill for opening and keeping drafts current, pulling calendar feeds, and accepting a draft when asked
- A `walkthrough` skill that reads the public guide at `https://docs.abletime.com/guides/1.0/agentic-ai/using-the-cursor-plugin`
- A `reports` skill that asks for a named report and returns the share link
- A `board` skill for epics, milestones, comments, schedule, dependency, block, and lock
- A `watch` skill and `/watch` command — poll for tasks assigned to you or landing in a named stage (10-minute floor; `notify` on hits, not chat)
- `intake`, `sorting-hat`, and `bugfix` skills (file and name the source, sort, fix and open a PR; `notify` after each)
- `sessionStart` and `stop` hooks that inject watch context and re-arm the watch loop

Watches persist in `~/.cursor/abletime-watches.json` (user-local, not in the repo).

## Reports

Reports are on the same server, `https://track.abletime.com/api/public/v2/mcp/plugins`. One connection covers them.

The tool is `get_report`. It takes a date range and, optionally, which reports to draw by name or by code (`AT-001` upward). The answer is the share link: a stub, a keycode, when the link expires, and a reader path on the same host, `/r/{stub}?key={keycode}`. The page opens without signing in. The link lasts fourteen days. The numbers behind the page are not in the answer unless `includeData` is set.

An owner or admin reads the whole organization, including money. A manager reads their own projects, without money.

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

Runs `scripts/validate-plugin.mjs` — checks manifest fields, logo path, the live MCP URL, no auth headers or variable substitution in `mcp.json`, required frontmatter on rules/skills/commands, and hook wiring.

## License

MIT
