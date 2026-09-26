# Worker - RabbitMQ Job Processor

NestJS application context (no HTTP server) that consumes async jobs from RabbitMQ.

## What Agents Get Wrong

- This is NOT a Bull/BullMQ worker. It uses **`@golevelup/nestjs-rabbitmq`** with `@RabbitSubscribe()` decorators
- RabbitMQ requires the **delayed message exchange plugin** — without it, retry with backoff won't work
- All queues are **quorum queues** (durable, HA) — not classic queues
- Idempotency uses **inbox pattern** (`inboxRepository.claim()`) — always check before processing
- Error handling: handlers ACK immediately, errors trigger retry via delayed exchange. Jobs must be marked FAILED in DB on error (prevents stuck PENDING)
- Outbox relay runs as a continuous polling loop (not cron), started on `onApplicationBootstrap()`
- Scheduled tasks use `@nestjs/schedule` with `@Cron()` decorators
- Graceful shutdown via `WorkerDrainService` — waits for active jobs before closing (25s timeout)
- Memory: runs with `--max-old-space-size=2048` for code review analysis
