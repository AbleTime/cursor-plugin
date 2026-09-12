---
name: watch
description: Start or stop AbleTime task watches — assigned to you or a named stage — with a 10-minute polling floor.
---

Follow the **watch** skill (`skills/watch/SKILL.md`).

- **Start:** set up assigned and/or stage watches, resolve ids via MCP, write `~/.cursor/abletime-watches.json`, arm `~/.cursor/abletime-watch-loop`, run the first check. A hit calls `notify`. No chat.
- **Stop:** `/watch stop` — delete `~/.cursor/abletime-watch-loop`; do not re-arm.
- **Assigned:** tasks assigned to the current user (`orientation` → `list_tasks` with `assignedUserId`).
- **Stage:** tasks landing in a named project stage (`get_project` → `list_tasks` with `stageId` + `projectId`).
- **Interval:** 10 minutes minimum; never faster. `notify` on hits; silent empty ticks. No chat.

Any text after `/watch` is the user's watch request (e.g. stage name, project, or `stop`).
