# Railgun -- Agent Orchestration Engine for Reliable Multi-Agent Workflows

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![ClawSecure](https://img.shields.io/badge/by-ClawSecure-blueviolet)](https://www.clawsecure.ai)

**Railgun is a free, open-source agent orchestration engine by ClawSecure that runs multi-agent workflows as deterministic YAML-defined pipelines.** Two AI agents [ping-ponged for 11 days and ran up a $47,000 bill](https://earezki.com/ai-news/2026-03-23-the-ai-agent-that-cost-47000-while-everyone-thought-it-was-working/) while everyone thought they were working. [88% of AI agent pilots never make it to production](https://composio.dev/blog/why-ai-agent-pilots-fail-2026-integration-roadmap). Chaining just 3 AI tools together drops reliability to [74%](https://fortune.com/2026/03/24/ai-agents-are-getting-more-capable-but-reliability-is-lagging-narayanan-kapoor/). The problem is not AI capability. The problem is that agents are improvising the workflow instead of following it.

Railgun fixes this. You define the workers and the steps in a YAML file. Railgun runs them in order, passing work from one agent to the next. No agent decides the flow. The YAML does. That is why Railgun workflows are cheaper, more reliable, and fixable when something breaks.

*Last updated: March 2026*

---

## Why Railgun

Every other multi-agent framework assumes the hard problem is "how do I get agents to collaborate?" Railgun assumes the hard problem is "how do I stop agents from destroying my workflow?" That is not a limitation. That is the product.

Four reasons teams choose Railgun over freestyle agent orchestration:

1. **Cheaper.** Step 10 does not pay for steps 1 through 9. Every Railgun agent starts clean with only the data it needs. In a traditional agent conversation, context window cost grows triangularly: 10 messages cost 55 units of context (1+2+3+...+10). In Railgun, 10 steps cost 10 units. That is 5.5x cheaper for the same work. No context window bloat, no recursive agent-to-agent billing spirals.

2. **Reliable.** Railgun locks execution order in YAML, not decided by an AI at runtime. Step 3 always follows Step 2. Period. When [90% per-step reliability compounds to 35% over 10 steps](https://fortune.com/2026/03/24/ai-agents-are-getting-more-capable-but-reliability-is-lagging-narayanan-kapoor/), deterministic sequencing is not a feature. It is a requirement.

3. **Fixable.** Railgun shows you exactly what step 4 received as input, what it tried, and why it failed. Run `clawsecure-railgun workflow report` and see every step's duration, status, and output. You fix one step. You do not debug a 50-message agent conversation or untangle a recursive call graph. No external observability platform. No LangSmith subscription. Built in.

4. **Safe.** Railgun will never run up a $47,000 bill. Set `maxRunSeconds: 1800` and Railgun kills any run that exceeds 30 minutes. No exceptions. No "but the agent thought it was making progress." Dead. Done. Failed. Set `maxConcurrentRuns: 5` and Railgun rejects run #6 cleanly with a message telling you exactly why. The Workflow Health Monitor checks every 5 minutes for stuck steps, stalled runs, and dead pipelines. Agents are powerful, but power without guardrails is a liability. Railgun is the guardrail.

---

## Quick Start

### Install

```bash
git clone https://github.com/ClawSecure/railgun.git
cd railgun
npm install
npm run build
```

### Define a Workflow

Your workflow is a config file, not a codebase. Change a step, change a model, add an agent -- it is a YAML edit, not a pull request. No Python. No JavaScript. No compilation. Edit the file, run the workflow.

Create a `workflow.yml`:

```yaml
id: blog-pipeline
name: Blog Post Pipeline
version: 1
maxRunSeconds: 1800       # 30 minutes max -- no runaway loops
maxConcurrentRuns: 3      # max 3 simultaneous runs of this workflow

agents:
  - id: researcher
    name: Researcher
    role: analysis
    workspace:
      baseDir: agents/researcher

  - id: writer
    name: Writer
    role: coding
    workspace:
      baseDir: agents/writer

steps:
  - id: research
    agent: researcher
    input: |
      Research this topic: {{task}}
      Reply with:
      STATUS: done
      FINDINGS: what you found
    expects: "STATUS: done"

  - id: write
    agent: writer
    input: |
      Write content based on these findings: {{findings}}
      Reply with:
      STATUS: done
      OUTPUT: the final content
    expects: "STATUS: done"
```

### Run It

```bash
clawsecure-railgun run blog-pipeline --task "AI agent security trends in 2026"
```

Railgun starts step 1 (researcher). The researcher does its work, produces output. That output automatically becomes the input for step 2 (writer). Each step gets fresh context with only the data it needs. If the run exceeds 30 minutes, Railgun kills it. If 3 runs are already active, Railgun rejects the new one. Safety is built in from the first line of YAML.

---

## Key Features

### Safety and Cost Control

- **Runtime limits** -- Railgun enforces `maxRunSeconds` (default: 1 hour) and `maxStepSeconds` (default: 10 minutes) on every workflow. Your agents will never run indefinitely. A run that exceeds its limit is automatically failed with a clear error message. This is the direct answer to the $47,000 runaway loop: set a ceiling, enforce it, done.
- **Concurrency caps** -- Five workflows running at once is a team. Fifty is a server fire. Railgun enforces `maxConcurrentRuns` per workflow (default: 5) and a global cap via `RAILGUN_MAX_GLOBAL_RUNS` (default: 20). When the limit is reached, new runs are cleanly rejected with a descriptive message telling you exactly why and what to do about it.
- **Workflow Health Monitor** -- Railgun watches your workflows while you sleep. The Health Monitor checks every 5 minutes for stuck steps, stalled runs, dead pipelines, and orphaned processes. If an agent claims a step and disappears (crash, timeout, network failure), the Health Monitor finds it and either retries or fails it cleanly. No more "my pipeline has been stuck for 3 days and nobody noticed."
- **Retry with escalation** -- When a step fails, Railgun does not just die. It retries (default: 2 retries). If retries are exhausted, it escalates to a human instead of looping forever. And if you come back to a failed run, `railgun workflow resume` picks up exactly where it left off.

### Observability and Debugging

- **Duration tracking** -- After every run, Railgun shows you exactly how long each agent took. "Triage: 45 seconds. Investigation: 2 minutes. Fix: 8 minutes." When step 3 suddenly takes 10x longer than usual, you know something changed. When your costs go up, you know which step to optimize. Available in the CLI via `clawsecure-railgun workflow report` and in the web dashboard by clicking any run card to see per-step durations alongside agent names and status badges. No external observability platform. No LangSmith subscription. Built in.
- **SQLite audit trail** -- Every run, step, and story is tracked in a local SQLite database. Full audit trail of what happened, what each step received, and what it produced. Query it directly if you need custom reporting.
- **Dashboard** -- Web UI for monitoring active runs, step status, per-step execution times, and workflow health. Click any run card to see the detail panel with agent names, durations, and status badges for every step. Launch it with `clawsecure-railgun dashboard`.

### Architecture

- **YAML-defined pipelines** -- Your workflow is a config file, not a codebase. Define agents, steps, handoffs, runtime limits, and concurrency caps in a simple YAML file. No Python. No JavaScript. No compilation. Your AI coding assistant can generate the YAML. You can copy/paste workflow templates and modify them. The barrier to entry is zero for vibe coders and non-developers.
- **Fresh context per step** -- Each agent worker gets only the input it needs, not the entire conversation history. A 6-step Railgun pipeline costs roughly 6x one agent call, not 21x (which is what you pay when every message includes the full history: 1+2+3+4+5+6=21). Railgun pipelines are 5.5x cheaper than equivalent agent conversations at 10 steps.
- **Two-phase polling** -- A cheap model checks for available work; the expensive model only fires when work exists. Cuts idle AI costs dramatically.
- **Docker-native** -- Railgun works in containers without fragile symlinks. Automatic recovery on container restart. Configurable paths via environment variables (`OPENCLAW_STATE_DIR`, `OPENCLAW_GATEWAY_HOST`, `RAILGUN_SKIP_SYMLINK`). Dockerfile and docker-compose.yml included.
- **Install safety** -- Railgun creates a backup of your config (`openclaw.json.railgun-backup`) before every write. If something goes wrong, your backup is right there. Uninstalling Railgun will never leave you with an empty, broken config.
- **2 runtime dependencies** -- Only `json5` and `yaml`. Minimal footprint, fast installs, small attack surface.

---

## How Railgun Works

Railgun reads a YAML workflow definition and executes it as a sequential pipeline. Each step is assigned to an agent worker. The workflow engine manages the handoffs:

1. **You define the workflow** in a YAML file: agents, steps, input templates, expected output patterns, runtime limits, and concurrency caps
2. **Railgun creates a run** in SQLite and queues the first step as "pending"
3. **An agent worker polls** for pending work using `peek`, then `claim`s it
4. **The worker executes** its step using an AI model with fresh context (only the input for this step, not the full history)
5. **The worker completes** the step with `complete`, and Railgun passes the output as input to the next step
6. **If a step fails**, the worker calls `fail` with an error. Railgun retries up to `max_retries`, then escalates to a human
7. **When the run finishes**, `workflow report` shows the full breakdown: per-step durations, statuses, and total runtime

The CLI provides direct access to the pipeline:

| Command | What It Does |
|---------|-------------|
| `clawsecure-railgun run <workflow>` | Start a new workflow run |
| `clawsecure-railgun peek` | Check if any steps are waiting for work |
| `clawsecure-railgun claim <step-id>` | Claim a pending step for execution |
| `clawsecure-railgun complete <step-id>` | Submit output for a completed step |
| `clawsecure-railgun fail <step-id>` | Report a step failure |
| `clawsecure-railgun workflow report <run>` | Show per-step durations, statuses, and total runtime |
| `clawsecure-railgun workflow resume <run>` | Resume a failed run from where it stopped |
| `clawsecure-railgun dashboard` | Launch the monitoring web UI with per-step timing |
| `clawsecure-railgun medic` | Run the watchdog health check |

**Example report output:**

```
Run Report: #33 (9a806667)
Workflow: bug-fix
Task: Duration tracking test
Status: running
Total Duration: 4m 23s

Steps:
  triage      |   0m 45s | done
  investigate |   2m 05s | done
  setup       |   0m 42s | done
  fix         |   0m 24s | failed
  verify      |        - | waiting
  pr          |        - | waiting
```

---

## When to Use Railgun vs Other Frameworks

Railgun is not trying to replace LangGraph, CrewAI, or AutoGen. It solves a different problem. The question is not which tool is better. The question is: do your agents actually need to improvise, or do they need to execute?

| If you need... | Use Railgun | Use LangGraph | Use CrewAI | Use AutoGen |
|----------------|-------------|---------------|------------|-------------|
| YAML-only workflow definition (no code) | Yes | No (Python) | No (Python) | No (Python) |
| No Python required | Yes | No | No | No |
| Automatic runaway prevention (runtime limits) | Yes | No | No | No |
| Concurrency caps (per-workflow + global) | Yes | No | No | No |
| Per-step duration reporting (CLI + dashboard) | Yes (built-in, free) | Via LangSmith (paid) | No | No |
| Fresh context per step (no window bloat) | Yes | Manual | No | No |
| Built-in cost controls, runtime limits, and retry logic | Yes | Manual | No | No |
| SQLite audit trail of every step | Yes (built-in, free) | Via LangSmith (paid) | No | No |
| Docker-native with container recovery | Yes | Manual | No | No |
| TypeScript/Node.js native | Yes | No (Python) | No (Python) | No (Python) |
| Sequential multi-step pipelines with predictable execution | Yes | Possible but overkill | No | No |
| Role-based agent teams that collaborate | Yes (sequential) | No | Yes (dynamic) | Partial |
| Branching, looping, conditional graph logic | No | Yes | No | Partial |
| Autonomous agent-to-agent negotiation | No (by design) | No | No | Yes (carries cost risk) |

**Choose Railgun when:** Your workflow is a sequence of known steps, you want agents to execute reliably without improvising, and you need built-in cost controls, runtime limits, and observability. Think assembly line, not brainstorm session. If you are building production agent workflows and need them to be cheaper, more reliable, and fixable when they break, Railgun was built for you.

**Choose LangGraph when:** You need complex branching logic, cycles, or state machines where the next step depends on runtime conditions. LangGraph is for when agents need to make decisions about what to do next. If your workflow is sequential, LangGraph is like using a fighter jet to go to the grocery store.

**Choose CrewAI when:** You want agents with distinct personas that collaborate dynamically as a team, delegating tasks to each other at runtime. CrewAI agents negotiate. Railgun agents execute. Negotiation is expensive, unpredictable, and impossible to debug. Execution is cheap, deterministic, and fixable.

**Choose AutoGen when:** You need agents to negotiate through open-ended conversation. Note: autonomous agent-to-agent negotiation is the behavior pattern behind the [$47,000 runaway loop](https://earezki.com/ai-news/2026-03-23-the-ai-agent-that-cost-47000-while-everyone-thought-it-was-working/) and [$18,400/week recursive billing spirals](https://moltbook-ai.com/posts/ai-agent-cost-optimization-2026/). AutoGen is now in maintenance mode (no new features, bug fixes only) as Microsoft consolidates both AutoGen and Semantic Kernel into the new [Microsoft Agent Framework](https://venturebeat.com/ai/microsoft-retires-autogen-and-debuts-agent-framework-to-unify-and-govern) (public preview October 2025, RC February 2026). Use with strong guardrails.

---

## Frequently Asked Questions

### What is Railgun?

Railgun is a free, open-source agent orchestration engine by ClawSecure that runs multi-agent workflows as deterministic YAML-defined pipelines. Instead of letting AI agents decide what to do next, Railgun locks the execution sequence in a YAML file. The AI does the thinking at each step, but the workflow itself is deterministic. Every feature in Railgun reinforces this: runtime limits exist because agents should not run forever, concurrency caps exist because agents should not spawn infinitely, and duration tracking exists because you should know exactly what each agent cost you.

### How does Railgun prevent runaway agent costs?

Railgun prevents runaway costs at three levels. First, `maxRunSeconds` (default: 1 hour) automatically kills any run that exceeds the configured time limit. Second, `maxStepSeconds` (default: 10 minutes) kills any individual step that runs too long. Third, `maxConcurrentRuns` (default: 5 per workflow, 20 globally) rejects new runs when capacity is reached. Combined with fresh context per step (no context window bloat) and two-phase polling (cheap model checks for work, expensive model only fires when work exists), Railgun is designed from the ground up to prevent the $47,000 runaway loops and $18,400/week billing spirals that plague autonomous agent systems.

### How is Railgun different from LangGraph or CrewAI?

Railgun is deliberately simpler. LangGraph gives you graph-based state machines with branching, looping, and invisible state transitions. When something breaks, you are debugging a state machine. CrewAI gives you role-based agent teams where agents have brainstorming sessions every time the workflow runs, and your token bill is agents talking to each other, not doing work. Railgun gives you a sequential pipeline: step A feeds step B feeds step C. No branching, no negotiation, no agent-to-agent improvisation. Most production workflows are sequential, and Railgun makes those workflows cheaper, more reliable, and easier to debug. Railgun also includes built-in runtime limits, concurrency caps, duration tracking, and a Workflow Health Monitor that LangGraph and CrewAI do not offer.

### Can I see how long each step takes?

Yes. Railgun tracks `started_at` and `completed_at` timestamps on every step. Run `clawsecure-railgun workflow report <run-id>` to see a formatted table with per-step durations, statuses, and total runtime. The same data is visible in the web dashboard by clicking any run card to see the detail panel with per-step timing alongside agent names and status badges. When step 3 suddenly takes 10x longer than usual, you know exactly where to investigate. No LangSmith subscription needed. No external observability tools. Built into Railgun.

### Does Railgun work with any AI model?

Railgun works with any AI model that your agent workers can call. The orchestration layer (YAML definitions, SQLite state, CLI commands, runtime limits, concurrency caps) is model-agnostic. Your agent workers handle the AI model calls; Railgun handles the sequencing, handoffs, timing, and safety guardrails.

### Can I use Railgun in Docker?

Yes. Railgun is Docker-native with ClawSecure's improvements over the original codebase. It works in containers without fragile symlinks, recovers automatically on container restart, and supports configurable paths via environment variables. A Dockerfile and docker-compose.yml are included.

### Is Railgun production-ready?

Railgun is at v0.5.1 and actively maintained by ClawSecure. It includes runtime limits, concurrency caps, retry logic with human escalation, per-step duration tracking, a monitoring dashboard, and the Workflow Health Monitor for detecting stuck workflows. ClawSecure uses Railgun internally for AI agent workflow orchestration. Every safety feature is runtime-tested on production infrastructure.

### What is the relationship between Railgun and antfarm?

Railgun is forked from [snarktank/antfarm](https://github.com/snarktank/antfarm) (MIT license, original work by Ryan Carson). ClawSecure improved the original with Docker-native support, automatic container recovery, configurable paths, runtime limits, concurrency caps, duration tracking, install safety, security hardening, and production reliability improvements. The fork is maintained independently by ClawSecure.

---

## What is ClawSecure?

[ClawSecure](https://www.clawsecure.ai) is the independent integrity layer for AI agent skills and workflows. ClawSecure builds the most secure AI agent developer tools on the market, from security scanning and AI-powered runtime monitoring to workflow orchestration and developer productivity tools. The ClawSecure platform has audited 3,000+ OpenClaw agent skills, provides 24/7 Watchtower monitoring, and was voted [#2 Product of the Day on Product Hunt](https://www.producthunt.com/products/clawsecure) on March 14, 2026.

---

## Free AI Agent Developer Tools by ClawSecure

ClawSecure builds the most secure AI agent developer tools on the market. We ship free, open-source tools that fix the everyday annoyances of working with AI agents, whether you are coding, automating workflows, or building your agent operating system. Every tool is MIT-licensed, free forever.

| Tool | What It Does |
|------|-------------|
| **[Railgun](https://github.com/ClawSecure/railgun)** | Deterministic agent orchestration engine. YAML-defined pipelines with runtime limits, concurrency caps, and per-step duration tracking for reliable multi-agent workflows. |
| **[ShutUp Tabs](https://github.com/ClawSecure/shutup-tabs)** | Auto-closes the diff tabs Claude Code force-opens on every file edit. Works in VS Code, Cursor, Windsurf, Antigravity, and all VS Code forks. |

See all free tools at **[openclaw-developer-tools](https://github.com/ClawSecure/openclaw-developer-tools)**. New tools ship weekly.

For ClawSecure's full AI agent security platform, including the free [OpenClaw security scanner](https://www.clawsecure.ai), visit [clawsecure.ai](https://www.clawsecure.ai).

---

## Contributing

Contributions are welcome. See the [issues page](https://github.com/ClawSecure/railgun/issues) for open items, or open a new issue to report bugs or request features.

---

## License

MIT License. Original work by Ryan Carson ([snarktank/antfarm](https://github.com/snarktank/antfarm)). ClawSecure improvements and maintenance. See [LICENSE](LICENSE) for full text.

---

Built by [ClawSecure](https://www.clawsecure.ai) -- The Integrity Layer for AI Agent Skills and Workflows
