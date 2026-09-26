/**
 * Configuration for E2E test runner
 */

export interface TestConfig {
    // Fossa API
    apiBaseUrl: string;

    // GitHub config (for creating PRs)
    github: {
        token: string; // PAT with repo access
        testRepos: string[]; // repos to use for testing (e.g., ["org/test-repo-1", "org/test-repo-2"])
        baseBranch: string; // usually "main"
    };

    // GitLab config (optional)
    gitlab?: {
        token: string;
        testRepos: string[];
        baseBranch: string;
    };

    // Test accounts to create
    testAccounts: {
        count: number;
        emailDomain: string; // e.g., "test.fossa.local"
        passwordTemplate: string;
    };

    // Parallel execution
    concurrency: number;

    // Delays (ms)
    delays: {
        betweenAccountCreation: number;
        betweenPRCreation: number;
        waitForReview: number;
    };
}

export const defaultConfig: TestConfig = {
    apiBaseUrl: process.env.FOSSA_API_URL || 'http://localhost:3000',

    github: {
        token: process.env.GITHUB_TEST_TOKEN || '',
        testRepos: (process.env.GITHUB_TEST_REPOS || '').split(',').filter(Boolean),
        baseBranch: 'main',
    },

    gitlab: process.env.GITLAB_TEST_TOKEN
        ? {
              token: process.env.GITLAB_TEST_TOKEN,
              testRepos: (process.env.GITLAB_TEST_REPOS || '').split(',').filter(Boolean),
              baseBranch: 'main',
          }
        : undefined,

    testAccounts: {
        count: parseInt(process.env.TEST_ACCOUNTS_COUNT || '3', 10),
        emailDomain: process.env.TEST_EMAIL_DOMAIN || 'test.fossa.local',
        passwordTemplate: process.env.TEST_PASSWORD || 'Test@123456!',
    },

    concurrency: parseInt(process.env.TEST_CONCURRENCY || '3', 10),

    delays: {
        betweenAccountCreation: 500,
        betweenPRCreation: 1000,
        waitForReview: 30000, // 30s to wait for review to complete
    },
};
