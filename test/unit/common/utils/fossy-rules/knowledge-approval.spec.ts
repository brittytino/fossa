import { requiresKnowledgeApproval } from '@libs/common/utils/fossy-rules/knowledge-approval';
import { FossyRulesOrigin } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

describe('requiresKnowledgeApproval', () => {
    it('never requires approval when disabled (or unset)', () => {
        for (const origin of Object.values(FossyRulesOrigin)) {
            expect(requiresKnowledgeApproval(undefined, origin)).toBe(false);
            expect(
                requiresKnowledgeApproval({ enabled: false }, origin),
            ).toBe(false);
        }
    });

    describe('when enabled, with no per-origin overrides', () => {
        const config = { enabled: true };

        it.each([
            FossyRulesOrigin.PAST_REVIEWS,
            FossyRulesOrigin.ONBOARDING_REPO_ANALYSIS,
            FossyRulesOrigin.MCP_AGENT,
        ])('requires approval for generated origin %s', (origin) => {
            expect(requiresKnowledgeApproval(config, origin)).toBe(true);
        });

        it('requires approval for repo_file_sync (auto-synced IDE rule files)', () => {
            expect(
                requiresKnowledgeApproval(
                    config,
                    FossyRulesOrigin.REPO_FILE_SYNC,
                ),
            ).toBe(true);
        });

        it.each([
            FossyRulesOrigin.MANUAL,
            FossyRulesOrigin.LIBRARY,
            FossyRulesOrigin.CLI,
        ])(
            'does not require approval for user/imported origin %s',
            (origin) => {
                expect(requiresKnowledgeApproval(config, origin)).toBe(false);
            },
        );
    });
});
