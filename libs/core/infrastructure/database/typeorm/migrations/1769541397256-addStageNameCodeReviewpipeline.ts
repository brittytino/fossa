import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageNameCodeReviewpipeline1769541397256 implements MigrationInterface {
    name = 'AddStageNameCodeReviewpipeline1769541397256';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ADD "stage_name" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ADD "metadata" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ADD "finishedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_cre_finished_at" ON "code_review_execution" ("finishedAt")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_cre_stage_status" ON "code_review_execution" ("stage_name", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_cre_automation_exec_created" ON "code_review_execution" ("automation_execution_id", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_cre_automation_exec_created"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_cre_stage_status"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_cre_finished_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution" DROP COLUMN "finishedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution" DROP COLUMN "metadata"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution" DROP COLUMN "stage_name"
        `);
    }
}
