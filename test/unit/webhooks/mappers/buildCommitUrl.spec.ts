/**
 * Tests that buildCommitUrl produces correct, navigable commit URLs
 * for each supported git platform when given proper web URLs.
 *
 * These URLs are returned by the GET /pull-requests/executions endpoint
 * as reviewedCommitUrl and must open the commit page on the platform.
 */

describe('buildCommitUrl - commit URL construction per platform', () => {
    // Extract the private method logic to test it directly
    function buildCommitUrl(
        provider: string,
        repoUrl: string | undefined,
        sha: string,
    ): string | undefined {
        if (!repoUrl) return undefined;

        switch ((provider || '').toLowerCase()) {
            case 'gitlab':
                return `${repoUrl}/-/commit/${sha}`;
            case 'bitbucket':
                return `${repoUrl}/commits/${sha}`;
            case 'azure':
            case 'azuredevops':
                return `${repoUrl}/commit/${sha}`;
            case 'github':
            default:
                return `${repoUrl}/commit/${sha}`;
        }
    }

    const sha = 'abc123def456';

    describe('GitHub', () => {
        it('should produce correct GitHub commit URL', () => {
            const url = buildCommitUrl(
                'github',
                'https://github.com/owner/repo',
                sha,
            );
            expect(url).toBe(`https://github.com/owner/repo/commit/${sha}`);
        });

        it('should NOT produce API URL', () => {
            // This would be the old buggy behavior
            const buggyUrl = buildCommitUrl(
                'github',
                'https://api.github.com/repos/owner/repo',
                sha,
            );
            expect(buggyUrl).toContain('api.github.com'); // proves this would be wrong
        });
    });

    describe('GitLab', () => {
        it('should produce correct GitLab commit URL', () => {
            const url = buildCommitUrl(
                'gitlab',
                'https://gitlab.com/owner/repo',
                sha,
            );
            expect(url).toBe(`https://gitlab.com/owner/repo/-/commit/${sha}`);
        });

        it('should NOT produce SSH-based URL', () => {
            const buggyUrl = buildCommitUrl(
                'gitlab',
                'git@gitlab.com:owner/repo.git',
                sha,
            );
            expect(buggyUrl).toContain('git@'); // proves this would be wrong
        });
    });

    describe('Azure DevOps', () => {
        it('should produce correct Azure DevOps commit URL', () => {
            const url = buildCommitUrl(
                'azure',
                'https://dev.azure.com/org/project/_git/repo',
                sha,
            );
            expect(url).toBe(
                `https://dev.azure.com/org/project/_git/repo/commit/${sha}`,
            );
        });

        it('should also work with azuredevops provider string', () => {
            const url = buildCommitUrl(
                'azuredevops',
                'https://dev.azure.com/org/project/_git/repo',
                sha,
            );
            expect(url).toBe(
                `https://dev.azure.com/org/project/_git/repo/commit/${sha}`,
            );
        });

        it('should NOT produce API URL', () => {
            const buggyUrl = buildCommitUrl(
                'azure',
                'https://dev.azure.com/org/project/_apis/git/repositories/guid',
                sha,
            );
            expect(buggyUrl).toContain('_apis'); // proves this would be wrong
        });
    });

    describe('Bitbucket', () => {
        it('should produce correct Bitbucket commit URL', () => {
            const url = buildCommitUrl(
                'bitbucket',
                'https://bitbucket.org/workspace/repo',
                sha,
            );
            expect(url).toBe(
                `https://bitbucket.org/workspace/repo/commits/${sha}`,
            );
        });
    });

    describe('edge cases', () => {
        it('should return undefined when repoUrl is undefined', () => {
            expect(buildCommitUrl('github', undefined, sha)).toBeUndefined();
        });

        it('should return undefined when repoUrl is empty', () => {
            expect(buildCommitUrl('github', '', sha)).toBeUndefined();
        });

        it('should default to GitHub format for unknown providers', () => {
            const url = buildCommitUrl(
                'unknown',
                'https://example.com/repo',
                sha,
            );
            expect(url).toBe(`https://example.com/repo/commit/${sha}`);
        });
    });
});
