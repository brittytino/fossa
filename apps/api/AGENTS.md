# API - NestJS REST API

Main backend. Exposes all business logic via REST. Producer only (never consumes from RabbitMQ).

## What Agents Get Wrong

- Controllers are thin: business logic goes in **use cases**, not controllers
- Auth has multiple methods: JWT, CLI keys (`Bearer fossa_*`), OAuth, SAML SSO. Public endpoints use `@Public()` decorator
- Authorization uses `@CheckPolicies()` + `PolicyGuard`, not custom guards. Repo-level checks use `checkRepoPermissions()` with `repo.key` from query/body
- Request context comes from `@Inject(REQUEST)` — use `request.user.organization.uuid` for tenant isolation
- Database migrations live in `libs/core/src/infrastructure/migrations`, not inside the API app
- Dry-run endpoints use SSE (Server-Sent Events) for streaming, not WebSockets
- Swagger docs are optional and protected by basic auth (`API_DOCS_ENABLED` env var)
