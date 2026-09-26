import { FossyRulesOrigin } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { isIdeRuleSource } from './file-patterns';

/** The values `origin` held before it was widened to {@link FossyRulesOrigin}. */
export type LegacyFossyRuleOrigin = 'user' | 'library' | 'generated';

export interface OriginInferenceInput {
    origin?: FossyRulesOrigin | null;
    sourcePath?: string | null;
    legacyOrigin?: LegacyFossyRuleOrigin | null;
}

/**
 * Map a rule onto a {@link FossyRulesOrigin}, used to backfill rows that predate
 * the widened enum. An already-explicit `origin` is returned as-is; otherwise
 * the legacy value and `sourcePath` are mapped. The IDE-file check precedes the
 * `generated` check so a synced file stays `REPO_FILE_SYNC` whatever authored it.
 */
export function resolveFossyRuleOrigin(
    input: OriginInferenceInput,
): FossyRulesOrigin {
    if (input.origin) {
        return input.origin;
    }

    if (input.legacyOrigin === 'library') {
        return FossyRulesOrigin.LIBRARY;
    }

    if (isIdeRuleSource(input.sourcePath)) {
        return FossyRulesOrigin.REPO_FILE_SYNC;
    }

    if (input.legacyOrigin === 'generated') {
        return FossyRulesOrigin.PAST_REVIEWS;
    }

    return FossyRulesOrigin.MANUAL;
}

/** Origins that represent machine-generated knowledge (rules or memories). */
export function isGeneratedFossyRuleOrigin(
    origin?: FossyRulesOrigin | null,
): boolean {
    return (
        origin === FossyRulesOrigin.PAST_REVIEWS ||
        origin === FossyRulesOrigin.ONBOARDING_REPO_ANALYSIS ||
        origin === FossyRulesOrigin.MCP_AGENT
    );
}
