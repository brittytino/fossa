import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIpE2bGlobalParameter1740000000000 implements MigrationInterface {
    name = 'AddIpE2bGlobalParameter1740000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_parameters_configkey_enum') THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_enum
                        WHERE enumlabel = 'ip_e2b'
                        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'global_parameters_configkey_enum')
                    ) THEN
                        ALTER TYPE "public"."global_parameters_configkey_enum"
                        RENAME TO "global_parameters_configkey_enum_old";

                        CREATE TYPE "public"."global_parameters_configkey_enum" AS ENUM(
                            'fossy_fine_tuning_config',
                            'code_review_max_files',
                            'ignore_paths_global',
                            'ip_e2b'
                        );

                        ALTER TABLE "global_parameters"
                        ALTER COLUMN "configKey" TYPE "public"."global_parameters_configkey_enum"
                        USING "configKey"::"text"::"public"."global_parameters_configkey_enum";

                        DROP TYPE "public"."global_parameters_configkey_enum_old";
                    END IF;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_parameters_configkey_enum') THEN
                    IF EXISTS (
                        SELECT 1 FROM pg_enum
                        WHERE enumlabel = 'ip_e2b'
                        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'global_parameters_configkey_enum')
                    ) THEN
                        CREATE TYPE "public"."global_parameters_configkey_enum_old" AS ENUM(
                            'fossy_fine_tuning_config',
                            'code_review_max_files',
                            'ignore_paths_global'
                        );

                        ALTER TABLE "global_parameters"
                        ALTER COLUMN "configKey" TYPE "public"."global_parameters_configkey_enum_old"
                        USING "configKey"::"text"::"public"."global_parameters_configkey_enum_old";

                        DROP TYPE "public"."global_parameters_configkey_enum";

                        ALTER TYPE "public"."global_parameters_configkey_enum_old"
                        RENAME TO "global_parameters_configkey_enum";
                    END IF;
                END IF;
            END $$;
        `);
    }
}
