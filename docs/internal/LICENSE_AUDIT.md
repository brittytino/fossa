# FOSSA - Internal License & Source-Code Audit

**Date:** 2026-09-26  
**Document Status:** Internal Working Document  
**Target Repository:** FOSSA (`fossa`)  
**Upstream Origin:** Fossa AI (`fossa-orchestrator` / `fossa-ai`)

---

## 1. Executive Summary & Legal Principles

The objective of project **FOSSA** is to establish an independent, free, open-source, self-hosted AI engineering and code intelligence platform.

The upstream repository was licensed under a **dual-licensing structure**:
1. **Open Source License (`license.md`):** GNU Affero General Public License v3.0 (AGPL-3.0) for standard codebase files.
2. **Enterprise License (`license_ee.md`):** Proprietary commercial license covering any file containing `.ee.` in its filename or located within an `ee/` directory.

### Key Compliance Rules:
1. **No Enterprise Code Redistribution:** Under `license_ee.md`, enterprise code cannot be merged into open-source forks or derivative works without a commercial agreement. Therefore, **all proprietary enterprise code must be identified, isolated, and removed**.
2. **Preserve Upstream Attribution:** AGPL-3.0 Section 5 requires preserving all legal notices and copyright attribution from upstream contributors (Fossa Tech). FOSSA will accurately attribute historical code to Fossa Tech while declaring FOSSA's independent open-source governance.
3. **No Commercial/Cloud Monetization Gating:** Artificial feature gates, billing logic, license token verification, and mandatory external SaaS dependencies must be stripped to make self-hosting first-class and unrestricted.

---

## 2. Classification of Repository Components

### Classification Matrix

| Category | Component / Path | Upstream License | Status in FOSSA | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Category 1: Clean OSS Code** | `libs/core/workflow` | AGPL-3.0 | Retain | Preserve inbox/outbox patterns and queue orchestration |
| **Category 1: Clean OSS Code** | `libs/platform` | AGPL-3.0 | Retain | Preserve Git provider abstractions (GitHub, GitLab, Bitbucket, Azure Repos, Forgejo) |
| **Category 1: Clean OSS Code** | `libs/identity` | AGPL-3.0 | Retain | Preserve local users, teams, RBAC, API tokens |
| **Category 1: Clean OSS Code** | `libs/llm` | AGPL-3.0 | Retain | Preserve BYOK and provider abstraction (OpenAI, Anthropic, Gemini, Vertex, Ollama/OpenAI-compatible) |
| **Category 1: Clean OSS Code** | `libs/agent-harness` & `libs/agents` | AGPL-3.0 | Retain | Preserve multi-agent execution framework |
| **Category 1: Clean OSS Code** | `libs/ai-engine` | AGPL-3.0 | Retain | Preserve context reference and prompt schemas |
| **Category 1: Clean OSS Code** | `libs/code-review` (core pipeline) | AGPL-3.0 | Retain | Preserve deterministic pipeline architecture and stages |
| **Category 1: Clean OSS Code** | `libs/issues` | AGPL-3.0 | Retain | Preserve issue tracking and management |
| **Category 1: Clean OSS Code** | `libs/notifications` | AGPL-3.0 | Retain | Preserve email / webhook delivery mechanisms |
| **Category 1: Clean OSS Code** | `libs/mcp-server` & `apps/mcp-manager` | AGPL-3.0 | Retain | Preserve Model Context Protocol integrations |
| **Category 1: Clean OSS Code** | `apps/cli` | MIT | Retain & Rebrand | CLI is MIT upstream; migrate executable to `fossa` |
| **Category 1: Clean OSS Code** | `apps/web` (Core Dashboard) | AGPL-3.0 | Retain & Rebrand | Next.js 15 UI, Radix UI, TanStack Query, diff views |
| **Category 2: Requires Modification** | `libs/code-review/pipeline` | AGPL-3.0 with EE hooks | Modify | Remove `PermissionValidationService`, `LicenseModule`, `FossyFineTuningStage` |
| **Category 2: Requires Modification** | `CodeBaseConfigService` (`libs/code-review`) | TBD (was in `libs/ee/codeBase`) | Rewrite / Migrate | Provide clean OSS `.fossa/` config loader without license check |
| **Category 2: Requires Modification** | `libs/fossyRules` -> FOSSA Rules | Mixed (Contracts OSS, Impl EE) | Rewrite / Migrate | Provide clean OSS Rules service and repository |
| **Category 2: Requires Modification** | `libs/llm` resolution | AGPL-3.0 | Modify | Decouple task slot resolution from commercial permission checks |
| **Category 2: Requires Modification** | `libs/telemetry` | AGPL-3.0 | Modify | Remove mandatory beacons; make telemetry strictly opt-in and off by default |
| **Category 2: Requires Modification** | `apps/web/src/features/ee` | Mixed | Restructure | Extract valid OSS features (BYOK, token usage, logs); delete subscription UI |
| **Category 2: Requires Modification** | Configuration (`.env.example`, `.env.schema`) | AGPL-3.0 | Clean | Remove billing, stripe, license, beacon, cloud vars |
| **Category 3: Enterprise / Proprietary** | `libs/ee/license/` | Fossa Enterprise License | **REMOVE** | Commercial Ed25519 JWT verification, seat allocation, trial limits |
| **Category 3: Enterprise / Proprietary** | `libs/ee/analytics-warehouse/` | Fossa Enterprise License | **REMOVE** | Enterprise warehouse, migrations, ingestion |
| **Category 3: Enterprise / Proprietary** | `libs/ee/sso/` | Fossa Enterprise License | **REMOVE** | Enterprise SAML SSO module |
| **Category 3: Enterprise / Proprietary** | `libs/ee/linked-repositories/` | Fossa Enterprise License | **REMOVE** | Cross-repo context with explicit EE LICENSE file |
| **Category 3: Enterprise / Proprietary** | `libs/ee/codeReviewSettingsLog/` | Fossa Enterprise License | **REMOVE** | EE settings audit logs |
| **Category 3: Enterprise / Proprietary** | `libs/core/providers/*.ee.ts` | Fossa Enterprise License | **REMOVE** | `code-review-pipeline.provider.ee.ts`, `file-analyzer.provider.ee.ts`, `pipeline.provider.ee.ts` |
| **Category 3: Enterprise / Proprietary** | `libs/ee/shared/services/permissionValidation.service.ts` | Fossa Enterprise License | **REMOVE** | Commercial gate (PlanType checks, user license, credits) |
| **Category 3: Enterprise / Proprietary** | `apps/web/src/features/subscription/` | Proprietary Web UI | **REMOVE** | Pricing plans, checkout UI, license status |
| **Category 3: Enterprise / Proprietary** | `apps/api/src/controllers/billingEvents.controller.ts` | Proprietary API | **REMOVE** | SaaS billing webhook callbacks |
| **Category 3: Enterprise / Proprietary** | `apps/api/src/controllers/spendLimit.controller.ts` | Proprietary API | **REMOVE** | Commercial spending limit enforcement |
| **Category 3: Enterprise / Proprietary** | `apps/api/src/controllers/fossaCredits.controller.ts` | Proprietary API | **REMOVE** | Prepaid credits metering |
| **Category 3: Enterprise / Proprietary** | `libs/analytics/modules/fossa-credits.module.ts` | Proprietary / Cloud | **REMOVE** | Metering charges for Fossa as provider |
| **Category 3: Enterprise / Proprietary** | `apps/try/` | Cloud Demo | **REMOVE** | Marketing demo application for `try.fossa.local` |
| **Category 3: Enterprise / Proprietary** | `license_ee.md` | Proprietary License | **REMOVE** | Redundant once all enterprise code is eliminated |
| **Category 4: Dependency Review** | `stripe` | MIT | Remove | Proprietary billing dependency; no longer needed |
| **Category 4: Dependency Review** | `posthog-node` | MIT | Review / Modify | PostHog library is OSS; remove cloud feature-flagging gate usage |
| **Category 4: Dependency Review** | `@sentry/*` | MIT / Apache 2.0 | Retain as Optional | Observability error reporting; user-configurable |
| **Category 4: Dependency Review** | `@pyroscope/nodejs` | Apache 2.0 | Retain as Optional | Profiling support; user-configurable |
| **Category 4: Dependency Review** | `ai`, `@ai-sdk/*`, `@langchain/*` | Apache 2.0 / MIT | Retain | Core AI provider SDKs |
| **Category 5: Unclear Items** | `libs/sandbox` | AGPL-3.0 / E2B | Review | E2B sandbox integration; ensure local execution fallback |
| **Category 5: Unclear Items** | `libs/cockpit` | AGPL-3.0 | Review | Ensure review analytics work directly off OLTP Postgres/Mongo without warehouse |

---

## 3. Detailed Component Analysis

### 3.1. Enterprise Code in `libs/ee/`
The upstream repository isolated several commercial features inside `libs/ee/`:
- **`libs/ee/license`**: Contains `self-hosted-license.service.ts` which uses an Ed25519 public key held by Fossa Tech to decrypt and verify JWT license tokens, checking seat counts, expiry dates, and trial credits. This has no place in an open-source, unrestricted product.
- **`libs/ee/linked-repositories`**: Contains an explicit `LICENSE` file stating: *"This directory is part of the Fossa Enterprise Edition. It is licensed under the Fossa Enterprise License... not the AGPL-3.0"*. Must be completely removed.
- **`libs/ee/shared/services/permissionValidation.service.ts`**: Enforces `PlanType.FREE`, `PlanType.BYOK`, `PlanType.MANAGED`, `PlanType.TRIAL`, blocking reviews with `INVALID_LICENSE`, `USER_NOT_LICENSED`, `PLAN_LIMIT_EXCEEDED`, and `CREDITS_EXHAUSTED`. Must be replaced with an open-source permissive pass-through.
- **`libs/ee/fossyRules` & `libs/ee/codeBase`**: These modules contained business logic (reading repository configs and storing custom review rules) that was entangled with enterprise license checks. The core review functionality will be rewritten cleanly into OSS modules.

### 3.2. Cloud and Monetization Code
- **Billing Endpoints**: `apps/api/src/controllers/billingEvents.controller.ts` listens for callbacks from `fossa-service-billing` (Stripe webhooks).
- **Credits & Spend Limits**: `apps/api/src/controllers/fossaCredits.controller.ts`, `spendLimit.controller.ts`, and `libs/analytics/modules/fossa-credits.module.ts` meter API tokens for monetized usage.
- **Subscription UI**: `apps/web/src/features/subscription` contains plan selection, license key inputs, and seat allocation interfaces.

### 3.3. Licensing Strategy for FOSSA
1. **Repository License**: FOSSA will adopt the **GNU Affero General Public License v3.0 (AGPL-3.0)** for the entire repository, consistent with the upstream open-source license.
2. **Attribution Notice**: A `NOTICE` file will be created documenting:
   - FOSSA is derived in part from the open-source Fossa AI codebase.
   - Copyright (c) Fossa Tech and contributors for historical upstream code.
   - Copyright (c) FOSSA contributors for ongoing development.
3. **No Dual License**: The commercial `license_ee.md` will be eliminated once all enterprise code is removed. FOSSA is 100% open source.
