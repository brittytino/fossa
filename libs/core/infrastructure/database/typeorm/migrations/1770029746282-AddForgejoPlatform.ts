import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForgejoPlatform1770029746282 implements MigrationInterface {
    name = 'AddForgejoPlatform1770029746282';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."integrations_platform_enum" ADD VALUE IF NOT EXISTS 'FORGEJO'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // PostgreSQL does not support removing values from enums directly.
        console.log(
            'Warning: Cannot remove enum value FORGEJO from integrations_platform_enum. Manual intervention required if rollback is needed.',
        );
    }
}
