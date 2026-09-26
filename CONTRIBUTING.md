# Contributing to FOSSA

Thank you for taking the time to contribute! FOSSA is a free, open-source, self-hosted AI code review platform, and every pull request, bug report, and doc improvement helps.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Request a Feature](#how-to-request-a-feature)
- [Development Setup](#development-setup)
- [Making a Pull Request](#making-a-pull-request)
- [Coding Standards](#coding-standards)
- [Commit Message Format](#commit-message-format)
- [Running Tests](#running-tests)

---

## Code of Conduct

Be respectful, constructive, and kind. Harassment in any form is not tolerated. By participating you agree to uphold these standards.

---

## How to Report a Bug

1. Search [existing issues](https://github.com/brittytino/fossa/issues) to avoid duplicates.
2. If none exist, open a new issue using the **Bug report** template.
3. Include reproduction steps, expected vs actual behavior, exact error text, version, and environment details.

> **Security vulnerabilities** — please follow the [Security Policy](./SECURITY.md) and do **not** file a public issue.

---

## How to Request a Feature

1. Open an issue using the **Feature request** template.
2. Issues labelled `?? needs approval` are awaiting core review — please wait before opening a PR.
3. Once approved (label removed), feel free to start coding or volunteer in the thread.

---

## Development Setup

### Requirements

- Node.js 22.x ([`.nvmrc`](./.nvmrc)) — run `nvm use` if needed
- pnpm 11.9.0 — `npm i -g pnpm@11.9.0`
- Docker + Docker Compose

### First-time setup

```bash
# Clone the repo
git clone https://github.com/brittytino/fossa.git
cd fossa

# Install dependencies
pnpm install

# Copy the example env file
cp .env.example .env

# Start infra (Postgres, MongoDB, RabbitMQ) + all services
pnpm run docker:start
```

See [`.env.example`](./.env.example) for all environment variables and their documentation.

---

## Making a Pull Request

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. **Write tests** for any new behavior. Existing tests must not regress.
3. **Lint and format** before pushing:
   ```bash
   pnpm run lint
   pnpm run format
   ```
4. **Open a PR** against `main` using the PR template. Fill in every section.
5. Keep PRs focused — one concern per PR makes review faster.

### PR title format

Use [Conventional Commits](https://www.conventionalcommits.org/) — CI enforces this:

```
feat(web): add dark mode toggle
fix(api): handle null reviewer assignment
docs: update self-hosted quickstart
refactor(libs/ai-engine): extract prompt builder
```

| Prefix | Changelog section |
|--------|------------------|
| `feat:` | Improvements |
| `fix:` | Bug fixes |
| `perf:` | Performance |
| `docs:`, `refactor:`, `chore:`, `ci:`, `test:` | Hidden from public changelog |

---

## Coding Standards

- **TypeScript (ES2022)** everywhere — no `any` unless justified with a comment.
- **NestJS patterns**: Module ? Controller ? UseCase ? Service/Repository.
- **Path aliases**: `@libs/*` for shared libraries, `@apps/*` for applications.
- **No new EE / commercial gating** — FOSSA is 100% open source.
- **No telemetry additions** without an explicit opt-in mechanism.
- Prefer explicit dependency injection via NestJS tokens over tight coupling.

---

## Commit Message Format

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer: Closes #123]
```

Use `!` after the type/scope for breaking changes: `feat(api)!: remove v1 endpoint`.

---

## Running Tests

```bash
# Unit + integration tests (requires infra running)
pnpm run test

# Watch mode
pnpm run test:watch

# RBAC / permission matrix
pnpm run test:rbac

# TypeScript type check
pnpm run typecheck
```

---

## Project Structure

```
fossa/
+-- apps/
¦   +-- api/        NestJS REST API
¦   +-- web/        Next.js 15 dashboard
¦   +-- worker/     RabbitMQ consumer
¦   +-- webhooks/   Webhook ingestion
¦   +-- cli/        @fossa/cli terminal tool
¦   +-- mcp-manager MCP server
+-- libs/           20 shared NestJS domain modules
+-- evals/          LLM evaluation harness
+-- docs/           Documentation (Mintlify)
```

---

## Questions?

Open a [Discussion](https://github.com/brittytino/fossa/discussions) or check the existing issues. We are happy to help!
