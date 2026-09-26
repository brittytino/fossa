/**
 * Signatures Fossy injects at the end (or, on bitbucket, the start) of
 * every comment it posts. Used by:
 *
 *   - Per-provider comment emitters
 *     (`github.service.ts`, `gitlab.service.ts`, `azureRepos.service.ts`,
 *      `forgejo.service.ts`, `bitbucket.service.ts`,
 *      `chatWithFossyFromGit.use-case.ts`, `commentManager.service.ts`)
 *     append the right marker to each Fossy comment.
 *
 *   - Read-side filters that need to recognize "this comment was
 *     written by Fossy, don't treat it as human signal":
 *     `commentAnalysis.service.ts` (rule-generator input filter),
 *     `validate-prerequisites.stage.ts` (skip re-review on standing
 *     PRs), etc.
 *
 * Two distinct values because bitbucket cloud's Atlassian Markdown
 * escapes raw HTML (it would render `<!-- fossy-codereview -->` as
 * visible text), so the HTML-comment marker the other providers
 * suffix to each comment is unusable on bitbucket. Bitbucket gets a
 * visible chip at the start of each comment instead.
 */
export const FOSSY_IDENTIFIERS = {
    LOGIN_KEYWORDS: ['fossy', 'fossa'],
    MARKDOWN_IDENTIFIERS: {
        DEFAULT: 'fossy-codereview',
        BITBUCKET: 'fossy|code-review',
    },
} as const;

/**
 * True when the given comment body looks like one Fossy itself
 * authored. Checks BOTH provider signatures so callers don't have to
 * special-case bitbucket. Case-insensitive on the body to match what
 * the existing filter sites have always done.
 */
export function isFossyAuthoredBody(body: string | undefined | null): boolean {
    const lower = (body ?? '').toLowerCase();
    return (
        lower.includes(FOSSY_IDENTIFIERS.MARKDOWN_IDENTIFIERS.DEFAULT) ||
        lower.includes(FOSSY_IDENTIFIERS.MARKDOWN_IDENTIFIERS.BITBUCKET)
    );
}
