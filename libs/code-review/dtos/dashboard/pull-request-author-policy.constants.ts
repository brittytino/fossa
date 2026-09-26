export const PULL_REQUEST_AUTHOR_POLICIES = [
    'all',
    'reviewable',
    'excluded',
] as const;

export type PullRequestAuthorPolicy =
    (typeof PULL_REQUEST_AUTHOR_POLICIES)[number];
