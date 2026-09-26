import {
    isGeneratedFossyRuleOrigin,
    resolveFossyRuleOrigin,
} from '@libs/common/utils/fossy-rules/resolve-origin';
import { FossyRulesOrigin } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

describe('resolveFossyRuleOrigin', () => {
    it('returns an explicit origin verbatim, ignoring legacyOrigin/sourcePath', () => {
        expect(
            resolveFossyRuleOrigin({
                origin: FossyRulesOrigin.MCP_AGENT,
                legacyOrigin: 'library',
                sourcePath: '.cursorrules',
            }),
        ).toBe(FossyRulesOrigin.MCP_AGENT);
    });

    it('infers LIBRARY from legacy origin', () => {
        expect(resolveFossyRuleOrigin({ legacyOrigin: 'library' })).toBe(
            FossyRulesOrigin.LIBRARY,
        );
    });

    it('infers REPO_FILE_SYNC from an IDE rule-file sourcePath (runtime, no legacyOrigin)', () => {
        expect(
            resolveFossyRuleOrigin({ sourcePath: '.cursor/rules/style.mdc' }),
        ).toBe(FossyRulesOrigin.REPO_FILE_SYNC);
    });

    it('prefers REPO_FILE_SYNC over GENERATED when both signals are present', () => {
        expect(
            resolveFossyRuleOrigin({
                legacyOrigin: 'generated',
                sourcePath: 'apps/web/.cursorrules',
            }),
        ).toBe(FossyRulesOrigin.REPO_FILE_SYNC);
    });

    it('infers PAST_REVIEWS from legacy generated origin without an IDE sourcePath', () => {
        expect(resolveFossyRuleOrigin({ legacyOrigin: 'generated' })).toBe(
            FossyRulesOrigin.PAST_REVIEWS,
        );
    });

    it('defaults to MANUAL for a legacy user rule', () => {
        expect(resolveFossyRuleOrigin({ legacyOrigin: 'user' })).toBe(
            FossyRulesOrigin.MANUAL,
        );
    });

    it('defaults to MANUAL when nothing is known (runtime fallback)', () => {
        expect(resolveFossyRuleOrigin({})).toBe(FossyRulesOrigin.MANUAL);
    });

    it('treats a non-IDE sourcePath as not REPO_FILE_SYNC', () => {
        expect(
            resolveFossyRuleOrigin({
                sourcePath: 'src/services/user.service.ts',
            }),
        ).toBe(FossyRulesOrigin.MANUAL);
    });
});

describe('isGeneratedFossyRuleOrigin', () => {
    it.each([
        FossyRulesOrigin.PAST_REVIEWS,
        FossyRulesOrigin.ONBOARDING_REPO_ANALYSIS,
        FossyRulesOrigin.MCP_AGENT,
    ])('treats %s as generated', (origin) => {
        expect(isGeneratedFossyRuleOrigin(origin)).toBe(true);
    });

    it.each([
        FossyRulesOrigin.MANUAL,
        FossyRulesOrigin.LIBRARY,
        FossyRulesOrigin.REPO_FILE_SYNC,
        undefined,
    ])('treats %s as not generated', (origin) => {
        expect(isGeneratedFossyRuleOrigin(origin)).toBe(false);
    });
});
