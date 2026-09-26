import { MigrationInterface, QueryRunner } from 'typeorm';

export class Baseline1763402134271 implements MigrationInterface {
    name = 'Baseline1763402134271';

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('code_review_execution')) {
            await queryRunner.query(`
                DROP TABLE IF EXISTS "diagnostic_analysis_history" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "diagnostic_scores" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "good_practices" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "insights" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "metrics" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "organization_automation_execution" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "organization_automations" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "organization_metrics" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "sprint" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "team_good_practices" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "team_insights" CASCADE
                `);
            await queryRunner.query(`
                DROP TABLE IF EXISTS "team_profiles" CASCADE
                `);

            return;
        }

        await queryRunner.query(`
            CREATE TYPE "public"."integration_configs_configkey_enum" AS ENUM(
                'columns_mapping',
                'project_management_setup_config',
                'repositories',
                'installation_github',
                'channel_info',
                'msteams_installation_app',
                'waiting_columns',
                'doing_column',
                'daily_checkin_schedule',
                'module_workitems_types',
                'bug_type_identifier',
                'automation_issue_alert_time',
                'team_project_management_methodology',
                'code_management_pat',
                'use_jql_to_view_board'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "integration_configs" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "configKey" "public"."integration_configs_configkey_enum" NOT NULL,
                "configValue" jsonb NOT NULL,
                "integration_id" uuid,
                "team_id" uuid,
                CONSTRAINT "PK_51eb1b60290d1ed72416c941806" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."integrations_platform_enum" AS ENUM(
                'INTERNAL',
                'GITHUB',
                'GITLAB',
                'JIRA',
                'SLACK',
                'NOTION',
                'MSTEAMS',
                'DISCORD',
                'AZURE_BOARDS',
                'AZURE_REPOS',
                'FOSSA_WEB',
                'BITBUCKET'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."integrations_integrationcategory_enum" AS ENUM(
                'CODE_MANAGEMENT',
                'PROJECT_MANAGEMENT',
                'COMMUNICATION'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "integrations" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "status" boolean NOT NULL,
                "platform" "public"."integrations_platform_enum" NOT NULL,
                "integrationCategory" "public"."integrations_integrationcategory_enum" NOT NULL,
                "organization_id" uuid,
                "auth_integration_id" uuid,
                "team_id" uuid,
                CONSTRAINT "REL_bcc9e3193d26aa3a235ed4d967" UNIQUE ("auth_integration_id"),
                CONSTRAINT "PK_8eca99e2d796509cc44b241a2d4" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_integrations" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "authDetails" jsonb NOT NULL,
                "status" boolean NOT NULL,
                "organization_id" uuid,
                "team_id" uuid,
                CONSTRAINT "PK_d9b10d059ef2e01261e72563b79" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."organization_parameters_configkey_enum" AS ENUM(
                'category_workitems_type',
                'timezone_config',
                'review_mode_config',
                'fossy_fine_tuning_config',
                'auto_join_config',
                'byok_config',
                'cockpit_metrics_visibility',
                'dry_run_limit'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "organization_parameters" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "configKey" "public"."organization_parameters_configkey_enum" NOT NULL,
                "configValue" jsonb NOT NULL,
                "description" character varying,
                "organization_id" uuid,
                CONSTRAINT "PK_3bd84bdeae04e1cb5b4654c3c0b" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."profile_configs_configkey_enum" AS ENUM('user_notifications')
        `);
        await queryRunner.query(`
            CREATE TABLE "profile_configs" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "configKey" "public"."profile_configs_configkey_enum" NOT NULL,
                "configValue" jsonb NOT NULL,
                "status" boolean NOT NULL DEFAULT true,
                "profile_id" uuid,
                CONSTRAINT "PK_d0aa63bcab8d27db86af079d10e" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "profiles" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "phone" character varying,
                "img" character varying,
                "position" character varying,
                "status" boolean NOT NULL DEFAULT true,
                "user_id" uuid,
                CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"),
                CONSTRAINT "PK_2c0c7196c89bdcc9b04f29f3fe6" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."auth_authprovider_enum" AS ENUM('credentials', 'google', 'github', 'gitlab')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "refreshToken" text NOT NULL,
                "expiryDate" TIMESTAMP NOT NULL DEFAULT now(),
                "used" boolean NOT NULL DEFAULT false,
                "authDetails" jsonb,
                "authProvider" "public"."auth_authprovider_enum" NOT NULL DEFAULT 'credentials',
                "userUuid" uuid,
                CONSTRAINT "UQ_5fb5d6abb950a839551fe3c5de9" UNIQUE ("refreshToken"),
                CONSTRAINT "PK_96102ee3fa43a27bc51bb91f3ca" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "permissions" jsonb NOT NULL,
                "user_id" uuid,
                CONSTRAINT "REL_03f05d2567b1421a6f294d69f4" UNIQUE ("user_id"),
                CONSTRAINT "PK_82c4b329177eba3db6338f732c5" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM(
                'owner',
                'billing_manager',
                'repo_admin',
                'contributor'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM(
                'active',
                'inactive',
                'pending',
                'awaiting_approval',
                'removed',
                'pending_email'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'owner',
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending',
                "organization_id" uuid,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_951b8f1dfc94ac1d0301a14b7e1" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "team_member" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "status" boolean NOT NULL DEFAULT true,
                "avatar" character varying,
                "communication" jsonb,
                "codeManagement" jsonb,
                "projectManagement" jsonb,
                "communicationId" character varying,
                "teamRole" character varying NOT NULL DEFAULT 'team_member',
                "user_id" uuid,
                "organization_id" uuid,
                "team_id" uuid,
                CONSTRAINT "PK_b29977c70b4331eb44b5bfa07eb" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "organizations" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "tenantName" character varying,
                "status" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_94726c8fd554481cd1db1be83e8" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."parameters_configkey_enum" AS ENUM(
                'board_priority_type',
                'checkin_config',
                'code_review_config',
                'communication_style',
                'deployment_type',
                'organization_artifacts_config',
                'team_artifacts_config',
                'platform_configs',
                'language_config',
                'issue_creation_config'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "parameters" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "configKey" "public"."parameters_configkey_enum" NOT NULL,
                "configValue" jsonb NOT NULL,
                "description" text,
                "active" boolean NOT NULL DEFAULT true,
                "version" integer NOT NULL DEFAULT '1',
                "team_id" uuid,
                CONSTRAINT "PK_e9d8d2297cdf6f98eb2e5941e0b" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."teams_status_enum" AS ENUM(
                'active',
                'inactive',
                'pending',
                'awaiting_approval',
                'removed',
                'pending_email'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "status" "public"."teams_status_enum" NOT NULL DEFAULT 'pending',
                "organization_id" uuid,
                CONSTRAINT "PK_59dcc55c0af733a59470895cce6" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."code_review_execution_status_enum" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "code_review_execution" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "status" "public"."code_review_execution_status_enum" NOT NULL DEFAULT 'pending',
                "message" text,
                "automation_execution_id" uuid,
                CONSTRAINT "PK_af6ec52dfbe7899f370c374a68b" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."automation_execution_status_enum" AS ENUM(
                'pending',
                'in_progress',
                'success',
                'error',
                'skipped'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "automation_execution" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "status" "public"."automation_execution_status_enum" NOT NULL DEFAULT 'success',
                "errorMessage" character varying,
                "dataExecution" jsonb,
                "pullRequestNumber" integer,
                "repositoryId" character varying,
                "origin" character varying,
                "team_automation_id" uuid,
                CONSTRAINT "PK_03d3e9bf351e94ad36aa18bb4c1" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "team_automations" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "status" boolean NOT NULL DEFAULT true,
                "teamUuid" uuid,
                "automationUuid" uuid,
                CONSTRAINT "PK_f52fdba6b8166b4469b8b11afdd" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."automation_automationtype_enum" AS ENUM(
                'AutomationTeamProgress',
                'AutomationInteractionMonitor',
                'AutomationIssuesDetails',
                'AutomationImproveTask',
                'AutomationEnsureAssignees',
                'AutomationCommitValidation',
                'AutomationWipLimits',
                'AutomationWaitingConstraints',
                'AutomationTaskBreakdown',
                'AutomationUserRequestedBreakdown',
                'AutomationRetroactiveMovement',
                'AutomationDailyCheckin',
                'AutomationSprintRetro',
                'AutomationExecutiveCheckin',
                'AutomationCodeReview'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."automation_level_enum" AS ENUM('ORGANIZATION', 'TEAM')
        `);
        await queryRunner.query(`
            CREATE TABLE "automation" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "tags" text NOT NULL,
                "antiPatterns" text NOT NULL,
                "status" boolean NOT NULL DEFAULT true,
                "automationType" "public"."automation_automationtype_enum" NOT NULL,
                "level" "public"."automation_level_enum" NOT NULL DEFAULT 'TEAM',
                CONSTRAINT "UQ_0320df2b2a4c8112d8dcd77ea3f" UNIQUE ("automationType"),
                CONSTRAINT "PK_abe1351d1749099604a7c3fd97b" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."context_references_processingstatus_enum" AS ENUM('pending', 'processing', 'completed', 'failed')
        `);
        await queryRunner.query(`
            CREATE TABLE "context_references" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "parentReferenceId" character varying(64),
                "scope" jsonb NOT NULL,
                "entityType" character varying(128) NOT NULL,
                "entityId" character varying(256) NOT NULL,
                "requirements" jsonb,
                "knowledgeRefs" jsonb,
                "revisionId" character varying(256),
                "origin" jsonb,
                "processingStatus" "public"."context_references_processingstatus_enum",
                "lastProcessedAt" TIMESTAMP,
                "metadata" jsonb,
                CONSTRAINT "PK_6e32c0cb61a0388444470095463" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."global_parameters_configkey_enum" AS ENUM(
                'fossy_fine_tuning_config',
                'code_review_max_files'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "global_parameters" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "configKey" "public"."global_parameters_configkey_enum" NOT NULL,
                "configValue" jsonb NOT NULL,
                "description" character varying,
                CONSTRAINT "PK_9af9c70370b4c6800e268f936b2" PRIMARY KEY ("uuid")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "integration_configs"
            ADD CONSTRAINT "FK_c7d2cd9ac41352d21841db61ec4" FOREIGN KEY ("integration_id") REFERENCES "integrations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "integration_configs"
            ADD CONSTRAINT "FK_1e32572c007608d399d3764acc6" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations"
            ADD CONSTRAINT "FK_2b83d3671eccf9da46693130ced" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations"
            ADD CONSTRAINT "FK_bcc9e3193d26aa3a235ed4d967b" FOREIGN KEY ("auth_integration_id") REFERENCES "auth_integrations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations"
            ADD CONSTRAINT "FK_b72e0311b1a611bd2543c4c67ec" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_integrations"
            ADD CONSTRAINT "FK_82cf9bd165ff5137a0807984fe1" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_integrations"
            ADD CONSTRAINT "FK_d060162c5688db74269445cc69c" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "organization_parameters"
            ADD CONSTRAINT "FK_9b62581310b3d2336de90debafc" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "profile_configs"
            ADD CONSTRAINT "FK_b2a4995bc1a788a9b695571540a" FOREIGN KEY ("profile_id") REFERENCES "profiles"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "profiles"
            ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth"
            ADD CONSTRAINT "FK_3ff4ca6607345724557de0f5ce9" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD CONSTRAINT "FK_03f05d2567b1421a6f294d69f45" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_21a659804ed7bf61eb91688dea7" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member"
            ADD CONSTRAINT "FK_0724b86622f89c433dee4cd8b17" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member"
            ADD CONSTRAINT "FK_c88647c9bb67047f0b8123bf767" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member"
            ADD CONSTRAINT "FK_a1b5b4f5fa1b7f890d0a278748b" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parameters"
            ADD CONSTRAINT "FK_acbd8447ca6aab80fd58870a52c" FOREIGN KEY ("team_id") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "teams"
            ADD CONSTRAINT "FK_fdc736f761896ccc179c823a785" FOREIGN KEY ("organization_id") REFERENCES "organizations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution"
            ADD CONSTRAINT "FK_d69f14dec6454d25968d2586314" FOREIGN KEY ("automation_execution_id") REFERENCES "automation_execution"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution"
            ADD CONSTRAINT "FK_8c4bf05f6ab2e6207a5aa3aedae" FOREIGN KEY ("team_automation_id") REFERENCES "team_automations"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_automations"
            ADD CONSTRAINT "FK_419193cca4bd24e16264af8fc78" FOREIGN KEY ("teamUuid") REFERENCES "teams"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_automations"
            ADD CONSTRAINT "FK_4adb958a3bdb43b2690edb83bd6" FOREIGN KEY ("automationUuid") REFERENCES "automation"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "team_automations" DROP CONSTRAINT "FK_4adb958a3bdb43b2690edb83bd6"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_automations" DROP CONSTRAINT "FK_419193cca4bd24e16264af8fc78"
        `);
        await queryRunner.query(`
            ALTER TABLE "automation_execution" DROP CONSTRAINT "FK_8c4bf05f6ab2e6207a5aa3aedae"
        `);
        await queryRunner.query(`
            ALTER TABLE "code_review_execution" DROP CONSTRAINT "FK_d69f14dec6454d25968d2586314"
        `);
        await queryRunner.query(`
            ALTER TABLE "teams" DROP CONSTRAINT "FK_fdc736f761896ccc179c823a785"
        `);
        await queryRunner.query(`
            ALTER TABLE "parameters" DROP CONSTRAINT "FK_acbd8447ca6aab80fd58870a52c"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member" DROP CONSTRAINT "FK_a1b5b4f5fa1b7f890d0a278748b"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member" DROP CONSTRAINT "FK_c88647c9bb67047f0b8123bf767"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_member" DROP CONSTRAINT "FK_0724b86622f89c433dee4cd8b17"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_21a659804ed7bf61eb91688dea7"
        `);
        await queryRunner.query(`
            ALTER TABLE "permissions" DROP CONSTRAINT "FK_03f05d2567b1421a6f294d69f45"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth" DROP CONSTRAINT "FK_3ff4ca6607345724557de0f5ce9"
        `);
        await queryRunner.query(`
            ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile_configs" DROP CONSTRAINT "FK_b2a4995bc1a788a9b695571540a"
        `);
        await queryRunner.query(`
            ALTER TABLE "organization_parameters" DROP CONSTRAINT "FK_9b62581310b3d2336de90debafc"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_integrations" DROP CONSTRAINT "FK_d060162c5688db74269445cc69c"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_integrations" DROP CONSTRAINT "FK_82cf9bd165ff5137a0807984fe1"
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations" DROP CONSTRAINT "FK_b72e0311b1a611bd2543c4c67ec"
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations" DROP CONSTRAINT "FK_bcc9e3193d26aa3a235ed4d967b"
        `);
        await queryRunner.query(`
            ALTER TABLE "integrations" DROP CONSTRAINT "FK_2b83d3671eccf9da46693130ced"
        `);
        await queryRunner.query(`
            ALTER TABLE "integration_configs" DROP CONSTRAINT "FK_1e32572c007608d399d3764acc6"
        `);
        await queryRunner.query(`
            ALTER TABLE "integration_configs" DROP CONSTRAINT "FK_c7d2cd9ac41352d21841db61ec4"
        `);
        await queryRunner.query(`
            DROP TABLE "global_parameters"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."global_parameters_configkey_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "context_references"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."context_references_processingstatus_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "automation"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."automation_level_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."automation_automationtype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "team_automations"
        `);
        await queryRunner.query(`
            DROP TABLE "automation_execution"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."automation_execution_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "code_review_execution"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."code_review_execution_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "teams"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."teams_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "parameters"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."parameters_configkey_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "organizations"
        `);
        await queryRunner.query(`
            DROP TABLE "team_member"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "permissions"
        `);
        await queryRunner.query(`
            DROP TABLE "auth"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."auth_authprovider_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "profiles"
        `);
        await queryRunner.query(`
            DROP TABLE "profile_configs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."profile_configs_configkey_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "organization_parameters"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."organization_parameters_configkey_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_integrations"
        `);
        await queryRunner.query(`
            DROP TABLE "integrations"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."integrations_integrationcategory_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."integrations_platform_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "integration_configs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."integration_configs_configkey_enum"
        `);
    }
}
