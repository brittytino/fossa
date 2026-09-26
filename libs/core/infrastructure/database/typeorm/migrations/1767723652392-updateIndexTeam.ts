import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndexTeam1767723652392 implements MigrationInterface {
    name = 'UpdateIndexTeam1767723652392';

    // Disable transaction because CONCURRENTLY cannot run inside transaction
    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_integration_configs_key" ON "integration_configs" ("configKey")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_integration_configs_team" ON "integration_configs" ("team_id")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_integration_configs_integration" ON "integration_configs" ("integration_id")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_organizations_tenant" ON "organizations" ("tenantName")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_organizations_status" ON "organizations" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_teams_status" ON "teams" ("status")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_teams_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_organizations_status"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_organizations_tenant"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_integration_configs_integration"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_integration_configs_team"
        `);
        await queryRunner.query(`
            DROP INDEX CONCURRENTLY IF EXISTS "public"."IDX_integration_configs_key"
        `);
    }
}
