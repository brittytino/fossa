import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewGlobalParameter1770129048194 implements MigrationInterface {
    name = 'AddNewGlobalParameter1770129048194';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_integration_configs_value_gin"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."global_parameters_configkey_enum"
            RENAME TO "global_parameters_configkey_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."global_parameters_configkey_enum" AS ENUM(
                'fossy_fine_tuning_config',
                'code_review_max_files',
                'ignore_paths_global'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "global_parameters"
            ALTER COLUMN "configKey" TYPE "public"."global_parameters_configkey_enum" USING "configKey"::"text"::"public"."global_parameters_configkey_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."global_parameters_configkey_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."global_parameters_configkey_enum_old" AS ENUM(
                'fossy_fine_tuning_config',
                'code_review_max_files'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "global_parameters"
            ALTER COLUMN "configKey" TYPE "public"."global_parameters_configkey_enum_old" USING "configKey"::"text"::"public"."global_parameters_configkey_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."global_parameters_configkey_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."global_parameters_configkey_enum_old"
            RENAME TO "global_parameters_configkey_enum"
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_integration_configs_value_gin" ON "integration_configs" ("configValue")
        `);
    }
}
