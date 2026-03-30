# Railgun Agents

Railgun provisions multi-agent workflows for OpenClaw. It installs workflow agent workspaces, wires agents into the OpenClaw config, and keeps a run record per task.

## Installing Railgun

**Prerequisites:** Node.js >= 22, OpenClaw v2026.2.9+, `gh` CLI (for PR steps).

### Steps

1. **Clone the repo** into the OpenClaw workspace:
   ```bash
   git clone https://github.com/ClawSecure/railgun.git ~/.openclaw/workspace/railgun
   ```

2. **Build:**
   ```bash
   cd ~/.openclaw/workspace/railgun
   npm install
   npm run build
   ```

3. **Link the CLI** (makes `clawsecure-railgun` available globally):
   ```bash
   npm link
   ```

4. **Install workflows** (provisions agents, cron jobs, and DB):
   ```bash
   clawsecure-railgun install
   ```

5. **Verify:** Run `clawsecure-railgun workflow list` -- you should see the available workflows.

If `clawsecure-railgun` fails with a `node:sqlite` error, your `node` binary may be Bun's wrapper instead of real Node.js 22+. Check with `node -e "require('node:sqlite')"`. See [#54](https://github.com/ClawSecure/railgun/issues/54) for workarounds.

## Why Railgun

- **Repeatable workflow execution**: Start the same set of agents with a consistent prompt and workspace every time.
- **Structured collaboration**: Each workflow defines roles (lead, developer, verifier, reviewer) and how they hand off work.
- **Traceable runs**: Runs are stored by task title so you can check status without hunting through logs.
- **Clean lifecycle**: Install, update, or uninstall workflows without manual cleanup.

## What It Changes in OpenClaw

- Adds workflow agents to `openclaw.json` (your main agent stays default).
- Creates workflow workspaces under `~/.openclaw/workspaces/workflows`.
- Stores workflow definitions and run state under `~/.openclaw/railgun`.
- Inserts a Railgun guidance block into the main agent's `AGENTS.md` and `TOOLS.md`.

## Uninstalling

- `clawsecure-railgun workflow uninstall <workflow-id>` removes a single workflow's agents, workspaces, and run records.
- `clawsecure-railgun uninstall` removes everything: all workflows, agents, cron jobs, and DB state.

If something fails, report the exact error and ask the user to resolve it before continuing.
