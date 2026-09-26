import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCliConfigToTeam1768153600000 implements MigrationInterface {
    name = 'AddCliConfigToTeam1768153600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "teams"
            ADD COLUMN IF NOT EXISTS "cliConfig" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "teams"
            DROP COLUMN IF EXISTS "cliConfig"
        `);
    }
}
