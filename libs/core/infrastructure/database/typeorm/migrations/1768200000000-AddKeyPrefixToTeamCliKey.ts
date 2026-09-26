import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyPrefixToTeamCliKey1768200000000 implements MigrationInterface {
    name = 'AddKeyPrefixToTeamCliKey1768200000000';

    // Disable transaction because CONCURRENTLY cannot run inside transaction
    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add keyPrefix column
        await queryRunner.query(`
            ALTER TABLE "team_cli_key"
            ADD COLUMN "keyPrefix" varchar(16)
        `);

        // Create index for fast lookup
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_team_cli_key_keyPrefix"
            ON "team_cli_key" ("keyPrefix")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_team_cli_key_keyPrefix"
        `);

        // Drop column
        await queryRunner.query(`
            ALTER TABLE "team_cli_key"
            DROP COLUMN "keyPrefix"
        `);
    }
}
