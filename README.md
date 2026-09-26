<div align="center">

# ?? FOSSA

### Autonomous AI Code Review & Software Intelligence Platform

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/brittytino/fossa?style=social)](https://github.com/brittytino/fossa)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/brittytino/fossa/pulls)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](./docker-compose.dev.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![CodeQL](https://img.shields.io/badge/CodeQL-enabled-blueviolet.svg?logo=github)](https://github.com/brittytino/fossa/security/code-scanning)

**FOSSA** is a free, 100% open-source, self-hosted AI engineering and code review platform. Powered by **Fossy**—an autonomous AI reviewer agent—FOSSA inspects pull requests, enforces architectural guidelines, catches bugs before production, and delivers actionable code suggestions directly into your Git workflow.

[Quickstart](#-quickstart-docker-compose) • [Features](#-core-features) • [Architecture](#-architecture) • [CLI](#-fossa-cli) • [Contributing](#-contributing)

</div>

---

## ?? Core Features

- ?? **Autonomous AI Reviewer (Fossy)**: Fossy analyzes PR diffs in depth, performs static and semantic inspection, verifies business rules, and posts actionable inline review comments.
- ?? **Fossy Rules**: Define organization-wide, team-level, or repository-specific review standards in natural language or YAML (`fossa-config.yml`).
- ?? **True BYOK (Bring Your Own Key)**: Zero LLM markups. Route requests directly to your own accounts at Anthropic (Claude), OpenAI (GPT-4o, o1/o3), Google Gemini, Vertex AI, or local models via Ollama / vLLM / LiteLLM.
- ? **Multi-Platform Git Integrations**: Native webhook and comment sync for GitHub, GitLab, Bitbucket, Azure DevOps Repos, and Forgejo.
- ?? **FOSSA Terminal CLI (`@fossa/cli`)**: Run comprehensive reviews, dry-runs, and rule evaluations straight from your terminal or CI/CD pipelines with the `fossa` command.
- ?? **Engineering Cockpit & Analytics**: Real-time visibility into PR cycle time, lead time breakdown, review turnaround, code health ratio, and developer throughput.
- ??? **Privacy-First Self-Hosted**: 100% self-hosted within your VPC or local machine. Your proprietary source code never touches third-party commercial middleware.
- ?? **100% AGPL-3.0 Open Source**: No artificial paywalls, no disabled features, no commercial telemetry, and no license locks.

---

## ?? Architecture

FOSSA is structured as a modular TypeScript monorepo powered by NestJS, Next.js 15, and RabbitMQ:

```
fossa/
+-- apps/
¦   +-- api/           # NestJS REST API (auth, review orchestration, policies, settings)
¦   +-- web/           # Next.js 15 Dashboard (App Router, Radix UI, React Query)
¦   +-- worker/        # RabbitMQ consumer (async webhook processing, AI review execution)
¦   +-- webhooks/      # High-throughput webhook ingestion (GitHub, GitLab, Bitbucket, Azure)
¦   +-- cli/           # @fossa/cli terminal companion tool (fossa command)
¦   +-- mcp-manager/   # Model Context Protocol (MCP) server & tool orchestration
+-- libs/
¦   +-- fossyRules/    # Fossy custom rules engine & pattern detection
¦   +-- ai-engine/     # Multi-turn reasoning, prompt synthesis, diff chunking
¦   +-- llm/           # In-repo unified LLM provider abstraction (OpenAI, Anthropic, Gemini, Vertex)
¦   +-- code-review/   # Pull request diff analysis, inline comment builder, syntax parsing
¦   +-- integrations/  # Git provider adapters (GitHub API, GitLab API, Azure, Forgejo)
¦   +-- cockpit/       # Engineering velocity & productivity metrics engine
¦   +-- platform/      # Core domain models, repository abstractions, event bus
```

---

## ?? Quickstart (Docker Compose)

The easiest way to spin up the entire FOSSA ecosystem (PostgreSQL, MongoDB, RabbitMQ, API, Worker, Webhooks, and Web UI) is via Docker Compose:

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) 24.0+ and [Docker Compose](https://docs.docker.com/compose/) v2+
- [Node.js](https://nodejs.org/) 22.x and [pnpm](https://pnpm.io/) 11.x (for local CLI / development)

### 1. Clone & Configure

```bash
git clone https://github.com/brittytino/fossa.git
cd fossa

# Create your local environment configuration
cp .env.example .env
```

### 2. Launch the Platform

```bash
# Start all services (Infra + API + Worker + Webhooks + Web Dashboard)
pnpm run docker:start:all
```

Once initialized, open your browser:
- **Web Dashboard**: `http://localhost:3000`
- **API Health**: `http://localhost:3001/api/health`
- **RabbitMQ Dashboard**: `http://localhost:15672` (default: `dev` / `devpass`)

---

## ?? FOSSA CLI

FOSSA includes a full-featured terminal CLI to trigger reviews locally before pushing:

```bash
# Install globally or run directly
npm install -g @fossa/cli

# Run an AI review on your local uncommitted git changes
fossa review

# Review staged changes
fossa review --staged

# Check system connectivity & health
fossa status
```

---

## ?? Configuration (`fossa-config.yml`)

Add a `fossa-config.yml` (or `.fossa/config.yml`) to the root of your repositories to customize Fossy's behavior:

```yaml
version: "1.0"
bot_name: "fossy"

review:
  auto_review: true
  ignore_draft_prs: true
  ignore_patterns:
    - "**/*.min.js"
    - "**/dist/**"
    - "**/vendor/**"

fossy_rules:
  - name: "strict-typescript"
    description: "Ensure explicit return types on public methods and disallow 'any'."
    severity: "warning"

  - name: "sql-injection-guard"
    description: "Flag unparameterized raw SQL query strings."
    severity: "critical"
```

---

## ?? Contributing

Contributions are warmly welcomed! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

1. Fork the repository.
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request against `main`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding standards, test requirements, and the PR review process.

---

## ?? Security

Please review our [Security Policy](./SECURITY.md). **Do not** file public issues for vulnerabilities — use [GitHub Private Vulnerability Reporting](https://github.com/brittytino/fossa/security/advisories/new) instead.

---

## ?? License & Attribution

- **Owner & Maintainer:** [brittytino](https://github.com/brittytino)
- **License:** [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE)
- **Upstream Notice:** FOSSA is derived from Kodus AI (AGPL-3.0), originally created by Kodus Tech and community contributors. See [NOTICE](./NOTICE) for complete attribution.
