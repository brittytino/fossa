import { FossyRulesOrigin } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { isGeneratedFossyRuleOrigin } from './resolve-origin';

export type FossyKnowledgeApprovalConfig = {
    enabled: boolean;
};

/**
 * Whether a rule/memory of the given origin needs approval before it becomes
 * active, under the resolved (global/repo/directory-merged) config. When
 * enabled, generated knowledge AND auto-synced IDE rule files
 * (`repo_file_sync`) require approval; manual/library/CLI origins remain
 * active. `repo_file_sync` is gated but deliberately kept out of
 * `isGeneratedFossyRuleOrigin` — it's imported, not machine-generated, and that
 * helper drives origin display / centralized-sync classification elsewhere.
 */
export function requiresKnowledgeApproval(
    config: FossyKnowledgeApprovalConfig | undefined,
    origin: FossyRulesOrigin,
): boolean {
    if (!config?.enabled) {
        return false;
    }

    return (
        isGeneratedFossyRuleOrigin(origin) ||
        origin === FossyRulesOrigin.REPO_FILE_SYNC
    );
}
