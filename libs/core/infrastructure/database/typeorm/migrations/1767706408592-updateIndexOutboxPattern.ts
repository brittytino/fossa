import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndexOutboxPattern1767706408592 implements MigrationInterface {
    name = 'UpdateIndexOutboxPattern1767706408592';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // INBOX: Critical index for reaper performance (consumer-specific timeouts)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_inbox_messages_consumer_status_locked"
            ON "fossa_workflow"."inbox_messages" ("consumerId", "status", "lockedAt")
        `);

        // INBOX: Index for general locked message queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_inbox_messages_locked_at"
            ON "fossa_workflow"."inbox_messages" ("lockedAt")
        `);

        // OUTBOX: Critical index for relay polling (status + createdAt ordering)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_outbox_messages_status_created"
            ON "fossa_workflow"."outbox_messages" ("status", "createdAt")
        `);

        // OUTBOX: Index for reaper queries (stuck messages in PROCESSING)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_outbox_messages_locked_at"
            ON "fossa_workflow"."outbox_messages" ("lockedAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "fossa_workflow"."IDX_outbox_messages_locked_at"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "fossa_workflow"."IDX_outbox_messages_status_created"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "fossa_workflow"."IDX_inbox_messages_locked_at"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "fossa_workflow"."IDX_inbox_messages_consumer_status_locked"
        `);
    }
}
