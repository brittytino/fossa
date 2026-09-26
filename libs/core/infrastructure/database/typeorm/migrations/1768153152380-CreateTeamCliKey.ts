import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamCliKey1768153152380 implements MigrationInterface {
    name = 'CreateTeamCliKey1768153152380';

    // Disable transaction because CONCURRENTLY cannot run inside transaction
    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "team_cli_key" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "keyHash" character varying NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "lastUsedAt" TIMESTAMP,
                "team_id" uuid,
                "created_by_user_id" uuid,
                CONSTRAINT "UQ_82cd0eb1c01e9242a72a4e11d71" UNIQUE ("keyHash"),
                CONSTRAINT "PK_2050f89d4b42fb8ac8656b54140" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY "IDX_team_cli_key_active" ON "team_cli_key" ("active")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY "IDX_team_cli_key_team" ON "team_cli_key" ("team_id")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY "IDX_automation_exec_performance" ON "automation_execution" ("team_automation_id", "status", "createdAt")
        `);
        await queryRunner.query(`
            ALTER TABLE "team_cli_key"
            ADD CONSTRAINT "FK_e487e776e0d252e9c6b2af24d59" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_cli_key"
            ADD CONSTRAINT "FK_2d6b2bee370911a1698fc57cebc" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "team_cli_key" DROP CONSTRAINT "FK_2d6b2bee370911a1698fc57cebc"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_cli_key" DROP CONSTRAINT "FK_e487e776e0d252e9c6b2af24d59"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_automation_exec_performance"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_team_cli_key_team"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_team_cli_key_active"
        `);
        await queryRunner.query(`
            DROP TABLE "team_cli_key"
        `);
    }
}
