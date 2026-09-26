import { MigrationInterface, QueryRunner } from 'typeorm';

export class Indexes1763403030146 implements MigrationInterface {
    name = 'Indexes1763403030146';

    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_org_params_key_org" ON "organization_parameters" ("configKey", "organization_id")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_users_org_status" ON "users" ("organization_id", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_users_email" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_integration_team_category_status" ON "integrations" ("team_id", "integrationCategory", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_parameters_active_only" ON "parameters" ("active")
            WHERE "active" = true
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_parameters_key_team_active" ON "parameters" ("configKey", "team_id", "active")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_teams_org_created" ON "teams" ("organization_id", "createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_teams_org_status" ON "teams" ("organization_id", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_automation_exec_pr_repo" ON "automation_execution" ("pullRequestNumber", "repositoryId")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_automation_exec_team_status" ON "automation_execution" ("team_automation_id", "status")
        `);

        // Creating indexes that TypeORM does not support natively

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_automation_exec_created_desc"
            ON "automation_execution" ("createdAt" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_parameters_config_value_gin"
            ON "parameters" USING GIN ("configValue")
        `);

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_org_params_config_value_gin"
            ON "organization_parameters" USING GIN ("configValue")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_automation_exec_team_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_automation_exec_pr_repo"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_teams_org_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_teams_org_created"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_parameters_key_team_active"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_parameters_active_only"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_integration_team_category_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_users_email"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_users_org_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY "public"."IDX_org_params_key_org"
        `);
    }
}
