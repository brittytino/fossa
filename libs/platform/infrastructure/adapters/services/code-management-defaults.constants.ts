export const DEFAULT_PR_TITLE = 'Fossa automated changes';
export const DEFAULT_COMMIT_MESSAGE = 'chore: update files';
export const DEFAULT_SOURCE_BRANCH_PREFIX = 'fossa-pr';

export function buildDefaultSourceBranchName(): string {
    return `${DEFAULT_SOURCE_BRANCH_PREFIX}-${Date.now()}`;
}

// Used to seed a brand-new (commit-less) repository so the branch + PR flow
// has a base branch to target. Providers that return an empty/undefined
// default branch for empty repos fall back to EMPTY_REPO_DEFAULT_BRANCH.
export const EMPTY_REPO_DEFAULT_BRANCH = 'main';
export const EMPTY_REPO_SEED_PATH = 'README.md';
export const EMPTY_REPO_SEED_COMMIT_MESSAGE =
    'Initialize repository for Fossa centralized config';
export const EMPTY_REPO_SEED_CONTENT = [
    '# Fossa centralized configuration',
    '',
    'This repository stores the centralized Fossa code review configuration.',
    'It was initialized automatically by Fossa.',
    '',
].join('\n');
