/**
 * E2E Test Runner
 *
 * Creates test accounts, sets up integrations, and opens PRs
 * to test the entire code review flow.
 *
 * Usage:
 *   npx ts-node scripts/e2e-test-runner/test-runner.ts
 *
 * Environment variables:
 *   FOSSA_API_URL - API base URL (default: http://localhost:3000)
 *   GITHUB_TEST_TOKEN - GitHub PAT with repo access
 *   GITHUB_TEST_REPOS - Comma-separated list of repos (e.g., "org/repo1,org/repo2")
 *   TEST_ACCOUNTS_COUNT - Number of test accounts to create (default: 3)
 *   TEST_EMAIL_DOMAIN - Email domain for test accounts (default: test.fossa.local)
 *   TEST_PASSWORD - Password for test accounts
 *   TEST_CONCURRENCY - Max parallel operations (default: 3)
 */

import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import { TestConfig, defaultConfig } from './config';
import { FossaApiClient, GitHubApiClient, GitLabApiClient, Repository } from './api-client';

interface TestAccount {
    id: string;
    email: string;
    password: string;
    name: string;
    organizationId?: string;
    teamId?: string;
    accessToken?: string;
    teamCliKey?: string;
}

interface TestPR {
    id: string;
    accountId: string;
    platform: 'github' | 'gitlab';
    repo: string;
    prNumber: number;
    prUrl: string;
    branchName: string;
    status: 'created' | 'review_triggered' | 'review_completed' | 'closed' | 'error';
    error?: string;
}

interface TestResult {
    accounts: TestAccount[];
    prs: TestPR[];
    summary: {
        accountsCreated: number;
        accountsFailed: number;
        prsCreated: number;
        prsFailed: number;
        reviewsCompleted: number;
        reviewsFailed: number;
        duration: number;
    };
}

// Test file content templates
const TEST_FILE_TEMPLATES = {
    typescript: {
        path: 'src/test-file.ts',
        content: (id: string) => `
// Test file generated for E2E testing - ${id}
// This file intentionally has some issues for code review to catch

export function processUserData(data: any) {
    // Issue: Using 'any' type
    const result = [];

    // Issue: Not handling null/undefined
    for (let i = 0; i < data.users.length; i++) {
        const user = data.users[i];

        // Issue: Potential XSS vulnerability
        document.innerHTML = user.name;

        // Issue: Using == instead of ===
        if (user.age == 18) {
            result.push(user);
        }

        // Issue: console.log in production code
        console.log('Processing user:', user.id);
    }

    return result;
}

export async function fetchData(url: string) {
    // Issue: No error handling
    const response = await fetch(url);
    const data = await response.json();

    // Issue: Hardcoded credentials
    const apiKey = "sk-1234567890abcdef";

    return { ...data, apiKey };
}

// Issue: Function too complex, should be broken down
export function validateAndTransform(input: any) {
    if (input && input.data && input.data.items && Array.isArray(input.data.items)) {
        return input.data.items.map((item: any) => {
            if (item.type === 'user') {
                return { ...item, processed: true, timestamp: Date.now() };
            } else if (item.type === 'admin') {
                return { ...item, processed: true, admin: true, timestamp: Date.now() };
            }
            return item;
        });
    }
    return [];
}
`,
    },
    javascript: {
        path: 'src/utils.js',
        content: (id: string) => `
// Test utils file - ${id}

function calculateTotal(items) {
    // Issue: No input validation
    var total = 0;

    // Issue: Using var instead of let/const
    for (var i = 0; i < items.length; i++) {
        total = total + items[i].price * items[i].quantity;
    }

    // Issue: Floating point arithmetic
    return total;
}

async function saveToDatabase(data) {
    // Issue: SQL injection vulnerability
    const query = "INSERT INTO users (name, email) VALUES ('" + data.name + "', '" + data.email + "')";

    // Issue: No try-catch
    await db.execute(query);
}

module.exports = { calculateTotal, saveToDatabase };
`,
    },
    python: {
        path: 'src/processor.py',
        content: (id: string) => `
# Test processor - ${id}

import pickle
import os

def process_input(user_input):
    # Issue: Command injection vulnerability
    os.system(f"echo {user_input}")

    # Issue: Unsafe deserialization
    data = pickle.loads(user_input)

    return data

def get_user(user_id):
    # Issue: SQL injection
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return execute_query(query)

class DataHandler:
    def __init__(self):
        # Issue: Hardcoded password
        self.password = "admin123"

    def handle(self, data):
        # Issue: Bare except
        try:
            return self.process(data)
        except:
            pass
`,
    },
};

class E2ETestRunner {
    private config: TestConfig;
    private accounts: TestAccount[] = [];
    private prs: TestPR[] = [];
    private githubClient?: GitHubApiClient;
    private gitlabClient?: GitLabApiClient;
    private limit: ReturnType<typeof pLimit>;

    constructor(config: TestConfig = defaultConfig) {
        this.config = config;
        this.limit = pLimit(config.concurrency);

        if (config.github.token) {
            this.githubClient = new GitHubApiClient(config.github.token);
        }

        if (config.gitlab?.token) {
            this.gitlabClient = new GitLabApiClient(config.gitlab.token);
        }
    }

    private log(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }

    private error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`, error?.message || error || '');
    }

    /**
     * Generate a unique email for test account
     */
    private generateEmail(index: number): string {
        const uniqueId = uuidv4().slice(0, 8);
        return `test-${index}-${uniqueId}@${this.config.testAccounts.emailDomain}`;
    }

    /**
     * Create a test account
     */
    private async createAccount(index: number): Promise<TestAccount> {
        const email = this.generateEmail(index);
        const password = this.config.testAccounts.passwordTemplate;
        const name = `Test User ${index}`;
        const id = uuidv4();

        this.log(`Creating account ${index + 1}/${this.config.testAccounts.count}: ${email}`);

        const fossaClient = new FossaApiClient(this.config);

        try {
            // 1. Sign up
            const signUpResult = await fossaClient.signUp(email, password, name);
            this.log(`Account created: ${email}`, {
                organizationId: signUpResult.organization.id,
                teamId: signUpResult.team.id,
            });

            // 2. Login (skip email confirmation for testing - assume auto-confirmed or use test mode)
            const loginResult = await fossaClient.login(email, password);

            fossaClient.setContext(signUpResult.organization.id, signUpResult.team.id);

            const account: TestAccount = {
                id,
                email,
                password,
                name,
                organizationId: signUpResult.organization.id,
                teamId: signUpResult.team.id,
                accessToken: loginResult.accessToken,
            };

            this.accounts.push(account);
            return account;
        } catch (error: any) {
            this.error(`Failed to create account ${email}`, error);

            const account: TestAccount = {
                id,
                email,
                password,
                name,
            };
            this.accounts.push(account);
            throw error;
        }
    }

    /**
     * Setup platform integration for an account
     */
    private async setupIntegration(
        account: TestAccount,
        platform: 'github' | 'gitlab',
    ): Promise<void> {
        if (!account.accessToken || !account.organizationId || !account.teamId) {
            throw new Error(`Account ${account.email} not properly initialized`);
        }

        this.log(`Setting up ${platform} integration for ${account.email}`);

        const fossaClient = new FossaApiClient(this.config);
        await fossaClient.login(account.email, account.password);
        fossaClient.setContext(account.organizationId, account.teamId);

        const token =
            platform === 'github' ? this.config.github.token : this.config.gitlab?.token;

        if (!token) {
            throw new Error(`No token configured for ${platform}`);
        }

        // Create integration
        await fossaClient.createIntegration(platform, token);

        // List and select repositories
        const repos = await fossaClient.listRepositories();
        const testRepos =
            platform === 'github' ? this.config.github.testRepos : this.config.gitlab?.testRepos;

        const selectedRepos = repos.filter((r) =>
            testRepos?.some((tr) => r.fullName === tr || r.name === tr),
        );

        if (selectedRepos.length === 0) {
            throw new Error(`No matching test repos found for ${platform}`);
        }

        await fossaClient.selectRepositories(selectedRepos);

        // Get CLI key for later use
        try {
            const cliKey = await fossaClient.getTeamCliKey();
            account.teamCliKey = cliKey.key;
        } catch (e) {
            this.log(`Could not get CLI key for ${account.email}`, e);
        }

        this.log(`Integration setup complete for ${account.email}`, {
            platform,
            repos: selectedRepos.map((r) => r.fullName),
        });
    }

    /**
     * Create a PR with test changes on GitHub
     */
    private async createGitHubPR(account: TestAccount, repoFullName: string): Promise<TestPR> {
        if (!this.githubClient) {
            throw new Error('GitHub client not initialized');
        }

        const [owner, repo] = repoFullName.split('/');
        const prId = uuidv4();
        const branchName = `test/e2e-${prId.slice(0, 8)}`;
        const timestamp = new Date().toISOString();

        this.log(`Creating PR in ${repoFullName} for ${account.email}`);

        try {
            // 1. Get default branch
            const defaultBranch = await this.githubClient.getDefaultBranch(owner, repo);

            // 2. Get latest commit SHA
            const ref = await this.githubClient.getRef(owner, repo, defaultBranch);
            const baseSha = ref.object.sha;

            // 3. Create branch
            await this.githubClient.createBranch(owner, repo, branchName, baseSha);

            // 4. Add test file
            const template = TEST_FILE_TEMPLATES.typescript;
            await this.githubClient.createOrUpdateFile(
                owner,
                repo,
                template.path,
                template.content(prId),
                `[E2E Test] Add test file for code review - ${timestamp}`,
                branchName,
            );

            // 5. Create PR
            const pr = await this.githubClient.createPullRequest(
                owner,
                repo,
                `[E2E Test] Code review test - ${prId.slice(0, 8)}`,
                `This PR was automatically created for E2E testing.

**Test ID:** ${prId}
**Created by:** ${account.email}
**Timestamp:** ${timestamp}

This PR contains intentional code issues for the code review system to detect.`,
                branchName,
                defaultBranch,
            );

            const testPR: TestPR = {
                id: prId,
                accountId: account.id,
                platform: 'github',
                repo: repoFullName,
                prNumber: pr.number,
                prUrl: pr.html_url,
                branchName,
                status: 'created',
            };

            this.prs.push(testPR);
            this.log(`PR created: ${pr.html_url}`);

            return testPR;
        } catch (error: any) {
            this.error(`Failed to create PR in ${repoFullName}`, error);

            const testPR: TestPR = {
                id: prId,
                accountId: account.id,
                platform: 'github',
                repo: repoFullName,
                prNumber: 0,
                prUrl: '',
                branchName,
                status: 'error',
                error: error.message,
            };

            this.prs.push(testPR);
            throw error;
        }
    }

    /**
     * Trigger code review on a PR
     */
    private async triggerReview(account: TestAccount, pr: TestPR): Promise<void> {
        if (!account.accessToken || !account.organizationId || !account.teamId) {
            throw new Error(`Account ${account.email} not properly initialized`);
        }

        this.log(`Triggering review for PR #${pr.prNumber} in ${pr.repo}`);

        const fossaClient = new FossaApiClient(this.config);
        await fossaClient.login(account.email, account.password);
        fossaClient.setContext(account.organizationId, account.teamId);

        const [, repoName] = pr.repo.split('/');

        await fossaClient.finishOnboarding({
            reviewPR: true,
            pullNumber: pr.prNumber,
            repositoryName: pr.repo,
            repositoryId: pr.repo,
        });

        pr.status = 'review_triggered';
        this.log(`Review triggered for PR #${pr.prNumber}`);
    }

    /**
     * Wait for review to complete and verify
     */
    private async waitForReview(pr: TestPR): Promise<boolean> {
        if (!this.githubClient) {
            return false;
        }

        const [owner, repo] = pr.repo.split('/');
        const maxWaitTime = this.config.delays.waitForReview;
        const checkInterval = 5000; // 5 seconds
        const startTime = Date.now();

        this.log(`Waiting for review on PR #${pr.prNumber}...`);

        while (Date.now() - startTime < maxWaitTime) {
            try {
                // Check for review comments
                const comments = await this.githubClient.listPRComments(owner, repo, pr.prNumber);
                const reviewComments = await this.githubClient.listPRReviewComments(
                    owner,
                    repo,
                    pr.prNumber,
                );

                // Look for Fossy comments
                const hasFossyComment =
                    comments.some(
                        (c) =>
                            c.body?.includes('fossy') ||
                            c.body?.includes('Fossy') ||
                            c.user?.login?.includes('fossy'),
                    ) ||
                    reviewComments.some(
                        (c) =>
                            c.body?.includes('suggestion') || c.user?.login?.includes('fossy'),
                    );

                if (hasFossyComment) {
                    pr.status = 'review_completed';
                    this.log(`Review completed for PR #${pr.prNumber}`, {
                        comments: comments.length,
                        reviewComments: reviewComments.length,
                    });
                    return true;
                }
            } catch (error) {
                this.error(`Error checking review status for PR #${pr.prNumber}`, error);
            }

            await this.sleep(checkInterval);
        }

        this.log(`Review timeout for PR #${pr.prNumber}`);
        return false;
    }

    /**
     * Cleanup: close PRs and delete branches
     */
    private async cleanup(): Promise<void> {
        this.log('Starting cleanup...');

        for (const pr of this.prs) {
            if (pr.platform === 'github' && this.githubClient) {
                const [owner, repo] = pr.repo.split('/');

                try {
                    // Close PR
                    if (pr.prNumber > 0) {
                        await this.githubClient.closePullRequest(owner, repo, pr.prNumber);
                        this.log(`Closed PR #${pr.prNumber}`);
                    }

                    // Delete branch
                    await this.githubClient.deleteBranch(owner, repo, pr.branchName);
                    this.log(`Deleted branch ${pr.branchName}`);

                    pr.status = 'closed';
                } catch (error) {
                    this.error(`Cleanup error for PR #${pr.prNumber}`, error);
                }
            }
        }

        this.log('Cleanup complete');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Run the full E2E test
     */
    async run(): Promise<TestResult> {
        const startTime = Date.now();
        let accountsCreated = 0;
        let accountsFailed = 0;
        let prsCreated = 0;
        let prsFailed = 0;
        let reviewsCompleted = 0;
        let reviewsFailed = 0;

        this.log('='.repeat(60));
        this.log('Starting E2E Test Run');
        this.log('='.repeat(60));
        this.log('Config:', {
            apiBaseUrl: this.config.apiBaseUrl,
            accountCount: this.config.testAccounts.count,
            githubRepos: this.config.github.testRepos,
            concurrency: this.config.concurrency,
        });

        try {
            // Phase 1: Create accounts
            this.log('\n--- Phase 1: Creating accounts ---');
            const accountPromises = Array.from({ length: this.config.testAccounts.count }, (_, i) =>
                this.limit(async () => {
                    try {
                        await this.createAccount(i);
                        accountsCreated++;
                    } catch (e) {
                        accountsFailed++;
                    }
                    await this.sleep(this.config.delays.betweenAccountCreation);
                }),
            );
            await Promise.all(accountPromises);

            // Phase 2: Setup integrations
            this.log('\n--- Phase 2: Setting up integrations ---');
            const successfulAccounts = this.accounts.filter((a) => a.accessToken);

            for (const account of successfulAccounts) {
                try {
                    if (this.config.github.token && this.config.github.testRepos.length > 0) {
                        await this.setupIntegration(account, 'github');
                    }
                } catch (e) {
                    this.error(`Integration setup failed for ${account.email}`, e);
                }
            }

            // Phase 3: Create PRs
            this.log('\n--- Phase 3: Creating PRs ---');
            const prPromises: Promise<void>[] = [];

            for (const account of successfulAccounts) {
                for (const repo of this.config.github.testRepos) {
                    prPromises.push(
                        this.limit(async () => {
                            try {
                                await this.createGitHubPR(account, repo);
                                prsCreated++;
                            } catch (e) {
                                prsFailed++;
                            }
                            await this.sleep(this.config.delays.betweenPRCreation);
                        }),
                    );
                }
            }
            await Promise.all(prPromises);

            // Phase 4: Trigger reviews
            this.log('\n--- Phase 4: Triggering reviews ---');
            const createdPRs = this.prs.filter((pr) => pr.status === 'created');

            for (const pr of createdPRs) {
                const account = this.accounts.find((a) => a.id === pr.accountId);
                if (account) {
                    try {
                        await this.triggerReview(account, pr);
                    } catch (e) {
                        this.error(`Failed to trigger review for PR #${pr.prNumber}`, e);
                    }
                }
            }

            // Phase 5: Wait for reviews
            this.log('\n--- Phase 5: Waiting for reviews ---');
            const reviewPromises = createdPRs.map((pr) =>
                this.limit(async () => {
                    const completed = await this.waitForReview(pr);
                    if (completed) {
                        reviewsCompleted++;
                    } else {
                        reviewsFailed++;
                    }
                }),
            );
            await Promise.all(reviewPromises);

            // Phase 6: Cleanup
            this.log('\n--- Phase 6: Cleanup ---');
            await this.cleanup();
        } catch (error) {
            this.error('Fatal error during test run', error);
        }

        const duration = Date.now() - startTime;

        const result: TestResult = {
            accounts: this.accounts,
            prs: this.prs,
            summary: {
                accountsCreated,
                accountsFailed,
                prsCreated,
                prsFailed,
                reviewsCompleted,
                reviewsFailed,
                duration,
            },
        };

        this.log('\n' + '='.repeat(60));
        this.log('E2E Test Run Complete');
        this.log('='.repeat(60));
        this.log('Summary:', result.summary);

        return result;
    }
}

// Main execution
async function main() {
    // Validate required env vars
    if (!process.env.GITHUB_TEST_TOKEN) {
        console.error('ERROR: GITHUB_TEST_TOKEN is required');
        console.error('Usage: GITHUB_TEST_TOKEN=ghp_xxx GITHUB_TEST_REPOS=org/repo npx ts-node scripts/e2e-test-runner/test-runner.ts');
        process.exit(1);
    }

    if (!process.env.GITHUB_TEST_REPOS) {
        console.error('ERROR: GITHUB_TEST_REPOS is required');
        process.exit(1);
    }

    const runner = new E2ETestRunner();
    const result = await runner.run();

    // Exit with error code if any failures
    const hasFailures =
        result.summary.accountsFailed > 0 ||
        result.summary.prsFailed > 0 ||
        result.summary.reviewsFailed > 0;

    process.exit(hasFailures ? 1 : 0);
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
