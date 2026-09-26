/**
 * Resolves a Fossy rule by UUID using layered lookup strategies.
 *
 * Why this exists: Fossy-generated PR comments link to rules via URLs like
 * `/settings/code-review/{repositoryId}/fossy-rules/{ruleId}`. The rule
 * detail page also expects `?teamId=...&directoryId=...` in the query
 * string, but those are not present in the generated links, so a naive
 * lookup inside a specific directory/team scope returns nothing and the
 * page redirects away — the "link doesn't even work" complaint.
 *
 * This helper falls back progressively:
 *   1. Look inside the repo (+ directory if provided).
 *   2. Look among inherited rules (if teamId is available).
 *   3. As a last resort, scan every rule in the organization by UUID.
 *
 * Each layer tolerates fetcher errors and tries the next one so a
 * transient failure in one scope does not break the whole resolution.
 */
export interface FossyRuleLike {
    uuid?: string;
    [k: string]: unknown;
}

export interface FossyRuleResolver {
    byRepo: (
        repositoryId: string,
        directoryId?: string,
    ) => Promise<FossyRuleLike[]>;
    inherited: (params: {
        teamId: string;
        repositoryId: string;
        directoryId?: string;
    }) => Promise<{
        directoryRules: FossyRuleLike[];
        globalRules: FossyRuleLike[];
        repoRules: FossyRuleLike[];
    }>;
    all: () => Promise<FossyRuleLike[]>;
}

export async function resolveFossyRuleById(
    ruleId: string,
    context: {
        repositoryId: string;
        directoryId?: string;
        teamId?: string;
    },
    resolver: FossyRuleResolver,
): Promise<FossyRuleLike | null> {
    // 1. Repository-scoped lookup (fastest, most specific).
    try {
        const rules = await resolver.byRepo(
            context.repositoryId,
            context.directoryId,
        );
        const hit = rules.find((r) => r.uuid === ruleId);
        if (hit) return hit;
    } catch {
        // fall through
    }

    // 2. Inherited rules (requires teamId to be available).
    if (context.teamId) {
        try {
            const { directoryRules, globalRules, repoRules } =
                await resolver.inherited({
                    teamId: context.teamId,
                    repositoryId: context.repositoryId,
                    directoryId: context.directoryId,
                });
            const hit = [...directoryRules, ...globalRules, ...repoRules].find(
                (r) => r.uuid === ruleId,
            );
            if (hit) return hit;
        } catch {
            // fall through
        }
    }

    // 3. Org-wide fallback — rescues deep-links that omit teamId/directoryId.
    try {
        const rules = await resolver.all();
        const hit = rules.find((r) => r.uuid === ruleId);
        if (hit) return hit;
    } catch {
        // fall through
    }

    return null;
}
