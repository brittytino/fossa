import { migrateRule } from '@libs/core/infrastructure/database/mongo/fossy-rules/migrate-origin-request-type';
import {
    FossyRuleRequestType,
    FossyRulesOrigin,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

describe('migrate-fossy-rules backfill — migrateRule', () => {
    it('maps legacy generated origin → past_reviews', () => {
        expect(migrateRule({ origin: 'generated' })?.origin).toBe(
            FossyRulesOrigin.PAST_REVIEWS,
        );
    });

    it('maps legacy user origin → manual', () => {
        expect(migrateRule({ origin: 'user' })?.origin).toBe(
            FossyRulesOrigin.MANUAL,
        );
    });

    it('maps a legacy rule with an IDE sourcePath → repo_file_sync', () => {
        expect(
            migrateRule({ origin: 'user', sourcePath: '.cursorrules' })?.origin,
        ).toBe(FossyRulesOrigin.REPO_FILE_SYNC);
    });

    it('backfills a missing origin → manual', () => {
        expect(migrateRule({ title: 'x' })?.origin).toBe(
            FossyRulesOrigin.MANUAL,
        );
    });

    it('normalizes requestType values', () => {
        expect(migrateRule({ requestType: 'memory_update' })?.requestType).toBe(
            FossyRuleRequestType.UPDATE,
        );
        expect(migrateRule({ requestType: 'memory_create' })?.requestType).toBe(
            FossyRuleRequestType.CREATE,
        );
    });

    it('is idempotent — already-migrated rules are skipped (returns null)', () => {
        expect(
            migrateRule({
                origin: FossyRulesOrigin.PAST_REVIEWS,
                requestType: FossyRuleRequestType.UPDATE,
            }),
        ).toBeNull();
        expect(migrateRule({ origin: FossyRulesOrigin.MANUAL })).toBeNull();
    });

    it('preserves other rule fields', () => {
        const result = migrateRule({
            origin: 'generated',
            title: 'No console.log',
            rule: 'Do not commit console.log',
        });
        expect(result).toMatchObject({
            title: 'No console.log',
            rule: 'Do not commit console.log',
            origin: FossyRulesOrigin.PAST_REVIEWS,
        });
    });
});
