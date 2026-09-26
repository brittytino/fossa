<!-- TODO: Add banner image/logo here -->

<h1 align="center">Fossa CLI</h1>

<p align="center">
  <strong>Catch bugs before they reach your pull request — AI code review from the terminal.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@fossa/cli"><img src="https://img.shields.io/npm/v/@fossa/cli.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@fossa/cli"><img src="https://img.shields.io/npm/dm/@fossa/cli.svg" alt="npm downloads"></a>
  <a href="https://github.com/brittytino/cli/blob/main/LICENSE"><img src="https://img.shields.io/github/license/brittytino/cli" alt="license"></a>
  <a href="https://github.com/brittytino/cli"><img src="https://img.shields.io/github/stars/brittytino/cli" alt="stars"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="node version"></a>
</p>

<p align="center">
  <a href="https://github.com/brittytino/fossa">Website</a> &middot;
  <a href="https://app.fossa.local">Sign Up</a> &middot;
  <a href="https://github.com/brittytino/cli/issues">Issues</a>
</p>

---

```bash
yarn global add @fossa/cli
```

---

## Quick Start

```bash
# 1. Install
yarn global add @fossa/cli

# 2. Authenticate (or skip for trial mode — no account needed)
fossa auth login

# 3. Review your code
fossa review
```

That's it. Fossa analyzes your changes, finds issues, and lets you fix them interactively — or auto-fix everything at once with `fossa review --fix`.

<!-- TODO: Add demo GIF showing interactive review in action -->

## What It Does

### Code Review

Analyze local changes, staged files, commits, or branch diffs. Fossa finds bugs, security issues, performance problems, and style violations — then suggests fixes with real code.

```bash
fossa review                    # Review working tree changes (interactive)
fossa review --staged           # Only staged files
fossa review --branch main      # Compare against a branch
fossa review --fix              # Auto-apply all fixable issues
fossa review --prompt-only      # Structured output for AI agents
```

Reviews are **context-aware** — Fossa reads your `.cursorrules`, `claude.md`, and `.fossa.md` so suggestions follow your team's standards. [More on review modes](#review-modes)

### Fossy Rules

Create, update, and inspect the Fossy Rules that guide Fossa behavior for your team.

```bash
fossa rules create --title "Use async/await" --rule "Prefer async/await over raw promises" --repo-id global --severity high --scope file --path "**/*.ts"
fossa rules update --uuid <uuid> --repo-id global --severity critical
fossa rules view --repo-id global
```

`fossa rules update` requires `--uuid`.

Defaults:

- `repo-id` defaults to `global`
- `severity` defaults to `medium`
- `scope` defaults to `file`
- `path` is optional (omitted means all files)

### PR Suggestions

Fetch AI-powered suggestions for open pull requests directly from your terminal.

```bash
fossa pr suggestions --pr-url https://github.com/org/repo/pull/42
fossa pr suggestions --pr-number 42 --repo-id <id>
```

Filter by severity, export as JSON or Markdown, or pipe into an AI agent with `--prompt-only` for automated fixes.

### Business Validation (Local Diff vs Task)

Run Fossa business-rules validation directly from your local diff with optional task reference.

```bash
# Working tree diff (default)
fossa pr business-validation

# Staged-only with explicit task reference
fossa pr business-validation --staged --task-id KC-1441

# Branch or files scope
fossa pr business-validation --branch main --task-id KC-1441
fossa pr business-validation src/service.ts src/use-case.ts --task-id KC-1441
```

### Fossa Trace

Diffs show _what_ changed. Trace records _why_ it changed.

AI agents make dozens of decisions per session — architecture choices, trade-offs, why approach X was picked over Y. Without a record, that reasoning vanishes when the session ends.

Trace captures your agent sessions locally, distills them into typed decisions, and hands them back the next time anyone touches those files.

```bash
fossa trace enable                     # Install capture hooks for this repo
fossa trace src/billing/invoice.ts     # Read the decisions for a path
fossa trace status                     # See what has been captured
fossa trace ui                         # Browse sessions in the browser
```

Works with no Fossa account. Raw sessions stay on your machine under `~/.fossa/sessions/`; distilled decisions travel with the repository on the orphan branch `fossa/trace/v1`. [More on Fossa Trace](#fossa-trace-1)

---

## Best With AI Agents

Fossa is designed to work **inside AI coding agents**. While you can use it standalone, the real power comes when your agent runs reviews automatically and fixes issues in a loop — no manual intervention needed.

**Works with:** Claude Code, Cursor, Windsurf, GitHub Copilot, Gemini CLI, and 20+ more environments.

### Install the Skill (recommended)

The fastest way to get started. Auto-detects your installed IDEs and sets everything up:

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/brittytino/cli/main/install.sh | bash
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "$tmp = Join-Path $env:TEMP 'fossa-install.ps1'; Invoke-WebRequest https://raw.githubusercontent.com/brittytino/cli/main/install.ps1 -OutFile $tmp; & $tmp"
```

This installs the Fossa CLI globally and deploys the review skill into every supported agent on your machine — Claude Code, Cursor, Windsurf, and others. One command, all environments.

### How It Works With Agents

Once installed, your AI agent can autonomously:

1. **Write code** as usual
2. **Run `fossa review --prompt-only`** to analyze changes
3. **Read the structured output** and understand each issue
4. **Fix the issues** automatically
5. **Repeat** until the review is clean

This creates a tight feedback loop: the agent writes, reviews, and fixes — all without leaving your IDE.

Beyond reviews, Fossa also captures **what your agent decided and why** via [Fossa Trace](#fossa-trace). Every reasoning step is saved — so when you (or another agent) pick up the work later, the full context is already there. No more re-explaining what was done or losing decisions between sessions.

### Setup: Claude Code

Add to your project's `CLAUDE.md`:

```markdown
## Code Review

After implementing changes, run `fossa review --prompt-only` to check for issues.
If issues are found, fix them and re-run until clean.
```

Or use the skill directly — after installing via the command above, just ask Claude Code to review your code and it will use Fossa automatically.

### Setup: Cursor / Windsurf

Add to your `.cursorrules` or equivalent:

```
When writing code:
1. Implement the feature
2. Run: fossa review --prompt-only
3. If issues are found, fix them automatically
4. Repeat until review is clean
5. Show final result
```

### Setup: Headless / Shared Environments

Set a team key so agents and shared machines are authenticated without individual logins:

```bash
export FOSSA_TEAM_KEY=fossa_xxxxx
fossa review --prompt-only
```

Works with Codex, CI runners, remote dev environments, and any context where personal login isn't practical. Get your key at [app.fossa.local/organization/cli-keys](https://app.fossa.local/organization/cli-keys).

### Copy & Paste Workflow (interactive)

If you prefer manual control:

1. Run `fossa review`
2. Navigate to a file with issues
3. Select **"Copy fix prompt for AI agent"**
4. Paste into Claude Code or Cursor — the AI fixes it

The copied prompt includes file path, line numbers, severity, and detailed suggestions — optimized for AI agents.

## Installation

### Skill installer (recommended — CLI + all your agents)

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/brittytino/cli/main/install.sh | bash
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "$tmp = Join-Path $env:TEMP 'fossa-install.ps1'; Invoke-WebRequest https://raw.githubusercontent.com/brittytino/cli/main/install.ps1 -OutFile $tmp; & $tmp"
```

Installs the CLI and deploys the review skill to all detected agents in one step.

### Keep everything updated

`fossa update` updates the CLI package.

For end users, the recommended way to refresh skills and agent integrations is:

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/brittytino/cli/main/install.sh | bash
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "$tmp = Join-Path $env:TEMP 'fossa-install.ps1'; Invoke-WebRequest https://raw.githubusercontent.com/brittytino/cli/main/install.ps1 -OutFile $tmp; & $tmp"
```

Fallback via CLI for common local agent roots:

```bash
fossa skills install        # install into detected local agent roots
fossa skills resync         # re-sync/refresh managed skills
fossa skills uninstall      # remove managed skills from detected targets
```

If you want to inspect the script before execution:

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/brittytino/cli/main/install.sh -o /tmp/fossa-install.sh
less /tmp/fossa-install.sh
bash /tmp/fossa-install.sh
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest https://raw.githubusercontent.com/brittytino/cli/main/install.ps1 -OutFile install.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

### CLI only

<details>
<summary><strong>yarn</strong></summary>

```bash
yarn global add @fossa/cli
```

</details>

<details>
<summary><strong>npx (no install)</strong></summary>

```bash
npx @fossa/cli review
```

</details>

<details>
<summary><strong>curl</strong></summary>

```bash
curl -fsSL https://raw.githubusercontent.com/brittytino/cli/main/install.sh | bash
```

</details>

<details>
<summary><strong>PowerShell</strong></summary>

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "$tmp = Join-Path $env:TEMP 'fossa-install.ps1'; Invoke-WebRequest https://raw.githubusercontent.com/brittytino/cli/main/install.ps1 -OutFile $tmp; & $tmp"
```

</details>

<details>
<summary><strong>Homebrew (coming soon)</strong></summary>

```bash
brew install fossa/tap/fossa
```

</details>

## Agent Mode

Fossa now supports an explicit **agent mode** for deterministic automation output.

### Global flag

Use `--agent` on any command to return a stable JSON envelope:

```json
{
    "ok": true,
    "command": "review",
    "data": {},
    "error": null,
    "meta": {
        "schemaVersion": "1.0",
        "cliVersion": "x.y.z",
        "mode": "agent",
        "durationMs": 123
    }
}
```

### Command schema introspection

```bash
fossa schema
fossa schema --command "pr suggestions"
```

### Field selection for smaller payloads

Available on `review` and `pr suggestions`:

```bash
fossa review --agent --fields summary,issues.file,issues.line
fossa pr suggestions --agent --pr-url https://github.com/org/repo/pull/42 --fields summary,issues.file
```

`--fields` requires `--agent` or `--format json`.

### Dry-run for mutable commands

```bash
fossa hook install --dry-run
fossa hook uninstall --dry-run
fossa trace disable --dry-run
```

Dry-run prints the planned actions and does not mutate local hooks/config/files.

## Review Modes

### Interactive (default)

```bash
fossa review
```

Navigate files with issue counts, preview fixes before applying, and copy AI-friendly prompts to paste into Claude Code or Cursor.

### Auto-fix

```bash
fossa review --fix
```

Applies all fixable issues at once. Shows a confirmation prompt before making changes.

### AI Agent

```bash
fossa review --prompt-only
```

Minimal, structured output designed for Claude Code, Cursor, and Windsurf. Perfect for autonomous generate-review-fix loops.

<details>
<summary><strong>More: output formats &amp; flags</strong></summary>

#### Output Formats

```bash
fossa review                           # Interactive (default)
fossa review --format json             # JSON output
fossa review --format markdown         # Markdown report
fossa review --prompt-only             # AI agent output
fossa review --format markdown -o report.md  # Save to file
```

#### Output Streams

- `stdout`: command result/payload (for example JSON/Markdown reports)
- `stderr`: debug traces (`--verbose`), spinner/progress messages, and errors

This keeps machine-readable output clean for piping:

```bash
fossa review --format json > review.json
fossa review --format json --verbose 1>review.json 2>review.debug.log
```

#### Diff Targets

```bash
fossa review                           # Working tree changes
fossa review --staged                  # Staged files only
fossa review --commit HEAD~1           # Specific commit
fossa review --branch main             # Compare against branch
fossa review src/index.ts src/utils.ts # Specific files
```

#### All Flags

| Flag                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| `--staged`             | Analyze only staged files                     |
| `--commit <sha>`       | Analyze a specific commit                     |
| `--branch <name>`      | Compare against a branch                      |
| `--rules-only`         | Only check configured rules                   |
| `--fast`               | Faster analysis for large diffs               |
| `--fix`                | Auto-apply all fixable issues                 |
| `--prompt-only`        | AI agent optimized output                     |
| `--context <file>`     | Include custom context file                   |
| `--format <fmt>`       | Output format: `terminal`, `json`, `markdown` |
| `--output <file>`      | Save output to file                           |
| `--fail-on <severity>` | Exit code 1 if issues meet or exceed severity |
| `-i, --interactive`    | Explicitly enable interactive mode            |

</details>

## Fossa Trace

Full reference for the decision capture system ([intro above](#fossa-trace)).

### Reading

Reading needs no verb — the paths are positional on the group itself:

```bash
# Decisions scoped to a file or a directory
fossa trace src/billing/invoice.ts
fossa trace src/billing src/payments

# A path that collides with a subcommand name is disambiguated with `--`
fossa trace -- status
```

The lookup is path matching against the decision's scope, exact or prefix, in
both directions. There is no embedding, vector store or similarity search, and
no network access: shared decisions are read out of the local object database.

### Setup

```bash
# Enable with specific agents
fossa trace enable --agents claude,cursor,codex

# Custom Codex config path
fossa trace enable --agents codex --codex-config ~/.codex/config.toml

# What has been captured, and which hooks are installed
fossa trace status

# Remove the hooks (the local store is preserved)
fossa trace disable
```

### Correcting what the model recorded

```bash
fossa trace forget <id>       # Drop a decision that is wrong
fossa trace pin <id>          # Always include it in the review context pack
fossa trace pin <id> --remove # Undo a pin
```

### Browsing sessions

```bash
fossa trace ui                # Serves a local page on 127.0.0.1:4711
fossa trace ui --port 8080 --no-open
```

**How it works:**

- Session lifecycle hooks write a redacted record per session to
  `~/.fossa/sessions/<repo>/records/`, keyed by a hash of the git root. Nothing
  is written inside the working tree, and every hook exits zero with no token
  and no reachable API.
- A `pre-push` hook runs distillation detached, so the push never waits. It
  shells out to whichever agent CLI you already have installed (`claude`,
  `codex`, `gemini`, `cursor-agent`) — no key management, no server round trip.
- Each push reprocesses `merge-base(default, HEAD)..HEAD` and **replaces** the
  branch's record, so pushing five times leaves one record. Per-commit summaries
  are cached, so a reprocess only pays for commits it has not seen.
- Records land on the orphan branch `fossa/trace/v1`, sharded one file per
  branch, and the source commit carries a `Fossa-Trace: <id>` trailer.
- Secrets are redacted out of the transcript before any model sees it, and the
  distilled output is redacted again before storage.

**Supported agents:** Claude Code, Cursor, Codex.

## CI/CD & Git Hooks

### Pre-push Hook

```bash
fossa hook install --fail-on error   # Block pushes with errors
fossa hook status                     # Check hook status
fossa hook uninstall                  # Remove hook
```

### Pipeline Usage

```bash
# Strict rules check with JSON output
fossa review --rules-only --format json --fail-on error

# Generate markdown report artifact
fossa review --format markdown --output review-report.md
```

## Authentication

Fossa supports multiple auth methods depending on your setup:

### Trial Mode (no account)

Just run `fossa review`. No signup needed. You get 5 reviews/day with up to 10 files and 500 lines per file — enough to try it out. [Sign up free](https://app.fossa.local) to remove limits.

### Personal Login

For individual developers. Creates a session with automatic token refresh.

```bash
fossa auth login           # Sign in with email/password
fossa auth status          # Check auth status and usage
fossa auth logout          # Sign out
```

Credentials are stored locally in `~/.fossa/credentials.json`.

### Team Key

For teams where not everyone needs their own account. A single shared key gives the whole team access — developers just set the key and start reviewing, no individual signup required.

```bash
fossa auth team-key --key fossa_xxxxx
```

Or set it as an environment variable:

```bash
export FOSSA_TEAM_KEY=fossa_xxxxx
```

Get your team key at [app.fossa.local/organization/cli-keys](https://app.fossa.local/organization/cli-keys). Team keys have configurable device limits managed from the dashboard.

This is also the recommended auth method for AI coding agents (Claude Code, Cursor, Codex) — set the env var once and every agent session is authenticated automatically.

### Repository Configuration

Repository configuration requires team-key auth:

- team keys work across `add`, `list`, `show`, `setup`, `set`, and pattern mutations through the CLI config endpoints

These commands always read and update the repository's current settings directly. There is no reset-to-default flow in the CLI.

`fossa config -r` and `fossa config --remote` are shortcuts for `fossa config remote add`.

```bash
fossa config -r .                       # Shortcut for: fossa config remote add .
fossa config --remote .                 # Shortcut for: fossa config remote add .
fossa config --remote . --json          # Add and print machine-readable result
fossa config --remote . --no-prompt     # Add without starting setup
fossa config remote add .               # Add the current repository explicitly
fossa config remote show .              # Inspect current repository settings
fossa config remote setup .             # Run guided setup again
fossa config remote setup . --json      # Print structured setup result
fossa config remote set . review.enabled true
fossa config remote set . review.enabled true --json
fossa config remote set . patterns.ignoreFiles "**/*.lock,dist/**"
fossa config remote add-pattern . ignore-files "dist/**"
fossa config remote add-ignore-file . "dist/**"
fossa config remote remove-base-branch . "release/*"
fossa config remote remove-pattern . base-branches "release/*"
fossa config remote open . --section suggestion-control
fossa config remote list --json
fossa config remote list                # List repositories already configured
```

When a repository is added from an interactive terminal, Fossa offers a guided setup for:

- automated review
- auto approve
- minimum severity level
- ignored file patterns
- base branch patterns
- ignored title patterns

Pattern fields accept glob expressions such as `**/*.lock`, `dist/**`, `release/*`, and `draft*`.

Use `fossa config remote open` when you need advanced repository settings that are still web-only. The CLI opens the Fossa app and prints the repository/section path to navigate.

Use `--json` with `show`, `set`, `open`, `add-pattern`, `remove-pattern`, and the pattern aliases when you need stable machine-readable output for scripts or AI agents.

When targeting a repository that is different from your current working directory, pass `owner/repo` explicitly instead of `.`:

```bash
fossa config -r Wellington01/fossa-extension
fossa config remote show Wellington01/fossa-extension
```

#### Local API note

When testing against the local backend with `yarn start:local`, repository configuration works with a team key when the local API exposes:

- `GET /cli/config/repositories/available`
- `GET /cli/config/repositories/selected`
- `POST /cli/config/repositories`
- `GET /cli/config/repositories/:repositoryId/settings`
- `PATCH /cli/config/repositories/:repositoryId/settings`

```text
Repository configuration access denied: ...
```

Example local commands:

```bash
export FOSSA_TEAM_KEY=fossa_xxxxx
yarn start:local config -r Wellington01/fossa-extension --no-prompt
yarn start:local config remote list --json
yarn start:local config remote show Wellington01/fossa-extension
```

### CI/CD Token

For pipelines and automated environments. Generated from your personal login:

```bash
fossa auth token           # Generate a CI/CD token
```

Then use it in your pipeline:

```bash
export FOSSA_TOKEN=<your-token>
fossa review --format json --fail-on error
```

> **Note:** For PR-level reviews in CI/CD, we recommend using the [Fossa platform](https://app.fossa.local) GitHub/GitLab integration instead of the CLI. It's purpose-built for PR workflows with inline comments, status checks, and team dashboards.

<details>
<summary><strong>Environment variables</strong></summary>

| Variable         | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| `FOSSA_API_URL`  | API endpoint (default: `https://api.fossa.local`). HTTPS only (except localhost). |
| `FOSSA_APP_URL`  | Optional Fossa app URL override for `fossa config remote open`.                |
| `FOSSA_TOKEN`    | CI/CD token for automated pipelines (generated via `fossa auth token`)         |
| `FOSSA_TEAM_KEY` | Team key for shared team access and AI coding agents                           |

</details>

## Privacy & Security

Fossa sends your code diffs to the Fossa API for analysis. We take this seriously:

- **HTTPS only** — All API communication is encrypted. Custom API URLs are validated.
- **No training on your code** — Your code is not used to train models.
- **Minimal data** — Only diffs and context files are sent, not your entire codebase.
- **Credentials stored locally** — Auth tokens are kept in `~/.fossa/credentials.json` on your machine.

## Contributing

We welcome contributions! Please see our [issues page](https://github.com/brittytino/cli/issues) to get started.

```bash
yarn install      # Install dependencies
yarn build        # Build
yarn dev          # Watch mode
yarn test         # Run tests
```

## License

[MIT](LICENSE)
