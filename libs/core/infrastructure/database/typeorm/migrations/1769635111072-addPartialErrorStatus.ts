import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartialErrorStatus1769635111072 implements MigrationInterface {
    name = 'AddPartialErrorStatus1769635111072';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update AutomationExecution Status Enum
        await queryRunner.query(`
            ALTER TYPE "public"."automation_execution_status_enum"
            RENAME TO "automation_execution_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."automation_execution_status_enum" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'partial_error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status" TYPE "public"."automation_execution_status_enum" USING "status"::"text"::"public"."automation_execution_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status"
            SET DEFAULT 'success'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."automation_execution_status_enum_old"
        `);

        // Update CodeReviewExecution Status Enum
        await queryRunner.query(`
            ALTER TYPE "public"."code_review_execution_status_enum"
            RENAME TO "code_review_execution_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."code_review_execution_status_enum" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'partial_error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status" TYPE "public"."code_review_execution_status_enum" USING "status"::"text"::"public"."code_review_execution_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status"
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."code_review_execution_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert CodeReviewExecution Status Enum
        await queryRunner.query(`
            CREATE TYPE "public"."code_review_execution_status_enum_old" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status" TYPE "public"."code_review_execution_status_enum_old" USING "status"::"text"::"public"."code_review_execution_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ALTER COLUMN "status"
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."code_review_execution_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."code_review_execution_status_enum_old"
            RENAME TO "code_review_execution_status_enum"
        `);

        // Revert AutomationExecution Status Enum
        await queryRunner.query(`
            CREATE TYPE "public"."automation_execution_status_enum_old" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status" TYPE "public"."automation_execution_status_enum_old" USING "status"::"text"::"public"."automation_execution_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ALTER COLUMN "status"
            SET DEFAULT 'success'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."automation_execution_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."automation_execution_status_enum_old"
            RENAME TO "automation_execution_status_enum"
        `);
    }
}
