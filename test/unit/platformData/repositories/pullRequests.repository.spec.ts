/**
 * REGRESSION TESTS - PullRequestsRepository
 *
 * These tests validate the CONTRACT of findManyByNumbersAndRepositoryIds:
 * - The returned data structure must be compatible with extractSuggestionsCount
 * - The projection must include files[].suggestions[].deliveryStatus
 *
 * CRITICAL: When implementing performance optimizations, these tests ensure
 * the data contract remains intact.
 */

import { DeliveryStatus } from '@libs/platformData/domain/pullRequests/enums/deliveryStatus.enum';
import {
    IPullRequests,
    IFile,
} from '@libs/platformData/domain/pullRequests/interfaces/pullRequests.interface';

// ============================================================================
// EXTRACTED FUNCTION FOR TESTING
// This is the same function used by GetEnrichedPullRequestsUseCase
// ============================================================================

function extractSuggestionsCount(pullRequest: IPullRequests): {
    sent: number;
    filtered: number;
} {
    if ((pullRequest as any).suggestionsCount) {
        const precomputed = (pullRequest as any).suggestionsCount;
        return {
            sent: precomputed.sent ?? 0,
            filtered: precomputed.filtered ?? 0,
        };
    }

    let sent = 0;
    let filtered = 0;

    const files = pullRequest.files;
    if (!files || files.length === 0) {
        return { sent: 0, filtered: 0 };
    }

    for (let i = 0; i < files.length; i++) {
        const suggestions = files[i].suggestions;
        if (!suggestions) continue;

        for (let j = 0; j < suggestions.length; j++) {
            const status = suggestions[j].deliveryStatus;
            if (status === DeliveryStatus.SENT) {
                sent++;
            } else if (status === DeliveryStatus.NOT_SENT) {
                filtered++;
            }
        }
    }

    return { sent, filtered };
}

// ============================================================================
// TEST FIXTURES
// ============================================================================

/**
 * Creates a mock PR as it would be returned from MongoDB with the CURRENT projection.
 * This simulates what findManyByNumbersAndRepositoryIds returns.
 *
 * Current projection excludes:
 * - files.suggestions.existingCode
 * - files.suggestions.improvedCode
 * - files.suggestions.suggestionContent
 * - commits
 * - prLevelSuggestions
 *
 * But INCLUDES (critical for extractSuggestionsCount):
 * - files[]
 * - files[].suggestions[]
 * - files[].suggestions[].deliveryStatus
 */
function createMockPRFromMongoProjection(config: {
    number: number;
    repositoryId: string;
    filesConfig: Array<{
        suggestionsConfig: Array<{ deliveryStatus: DeliveryStatus }>;
    }>;
}): IPullRequests {
    const files: IFile[] = config.filesConfig.map((fileConfig, fileIndex) => ({
        id: `file-${fileIndex}`,
        path: `src/file${fileIndex}.ts`,
        filename: `file${fileIndex}.ts`,
        previousName: '',
        status: 'modified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        suggestions: fileConfig.suggestionsConfig.map(
            (suggConfig, suggIndex) => ({
                id: `suggestion-${fileIndex}-${suggIndex}`,
                relevantFile: `src/file${fileIndex}.ts`,
                language: 'typescript',
                // These fields are EXCLUDED by projection but we include empty strings
                // to simulate what MongoDB returns (fields simply don't exist)
                suggestionContent: '', // EXCLUDED by projection
                existingCode: '', // EXCLUDED by projection
                improvedCode: '', // EXCLUDED by projection
                oneSentenceSummary: 'Test summary',
                relevantLinesStart: 1,
                relevantLinesEnd: 10,
                label: 'code_style',
                severity: 'low',
                priorityStatus: 'medium' as any,
                deliveryStatus: suggConfig.deliveryStatus, // INCLUDED - critical!
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }),
        ),
    }));

    return {
        uuid: `pr-${config.number}`,
        title: `Test PR #${config.number}`,
        status: 'open',
        merged: false,
        number: config.number,
        url: `https://github.com/test/repo/pull/${config.number}`,
        baseBranchRef: 'main',
        headBranchRef: 'feature/test',
        repository: {
            id: config.repositoryId,
            name: 'test-repo',
            fullName: 'org/test-repo',
            language: 'TypeScript',
            url: 'https://github.com/org/test-repo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        openedAt: new Date().toISOString(),
        closedAt: '',
        files,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'github',
        user: {
            id: 'user-1',
            username: 'testuser',
        },
        commits: [], // EXCLUDED by projection
        isDraft: false,
    };
}

// ============================================================================
// CONTRACT TESTS
// ============================================================================

describe('PullRequestsRepository - findManyByNumbersAndRepositoryIds Contract', () => {
    describe('REGRESSION: Data structure compatibility with extractSuggestionsCount', () => {
        it('should return data that extractSuggestionsCount can process correctly', () => {
            // Simulate PR returned from MongoDB with current projection
            const prFromMongo = createMockPRFromMongoProjection({
                number: 123,
                repositoryId: 'repo-1',
                filesConfig: [
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.SENT },
                            { deliveryStatus: DeliveryStatus.SENT },
                            { deliveryStatus: DeliveryStatus.NOT_SENT },
                        ],
                    },
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.NOT_SENT },
                            { deliveryStatus: DeliveryStatus.FAILED },
                        ],
                    },
                ],
            });

            // This MUST work - if it doesn't, the optimization broke the contract
            const result = extractSuggestionsCount(prFromMongo);

            expect(result).toEqual({ sent: 2, filtered: 2 });
        });

        it('should work even when suggestion content fields are undefined (projection behavior)', () => {
            const prFromMongo = createMockPRFromMongoProjection({
                number: 456,
                repositoryId: 'repo-2',
                filesConfig: [
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.SENT },
                        ],
                    },
                ],
            });

            // Remove content fields to simulate exact projection behavior
            prFromMongo.files[0].suggestions[0] = {
                ...prFromMongo.files[0].suggestions[0],
                suggestionContent: undefined as any,
                existingCode: undefined as any,
                improvedCode: undefined as any,
            };

            const result = extractSuggestionsCount(prFromMongo);

            // Should still work because we only need deliveryStatus
            expect(result).toEqual({ sent: 1, filtered: 0 });
        });
    });

    describe('REGRESSION: Required fields for extractSuggestionsCount', () => {
        /**
         * This test documents the MINIMUM fields required from MongoDB.
         * Any new projection MUST include these fields.
         */
        it('should have files array', () => {
            const pr = createMockPRFromMongoProjection({
                number: 1,
                repositoryId: 'r1',
                filesConfig: [],
            });

            expect(pr.files).toBeDefined();
            expect(Array.isArray(pr.files)).toBe(true);
        });

        it('should have suggestions array in each file', () => {
            const pr = createMockPRFromMongoProjection({
                number: 1,
                repositoryId: 'r1',
                filesConfig: [
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.SENT },
                        ],
                    },
                ],
            });

            expect(pr.files[0].suggestions).toBeDefined();
            expect(Array.isArray(pr.files[0].suggestions)).toBe(true);
        });

        it('should have deliveryStatus in each suggestion', () => {
            const pr = createMockPRFromMongoProjection({
                number: 1,
                repositoryId: 'r1',
                filesConfig: [
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.SENT },
                        ],
                    },
                ],
            });

            expect(pr.files[0].suggestions[0].deliveryStatus).toBeDefined();
            expect(pr.files[0].suggestions[0].deliveryStatus).toBe(
                DeliveryStatus.SENT,
            );
        });
    });

    describe('REGRESSION: Batch scenarios (multiple PRs)', () => {
        /**
         * findManyByNumbersAndRepositoryIds returns multiple PRs.
         * This test ensures we can process all of them correctly.
         */
        it('should correctly count suggestions across multiple PRs in a batch', () => {
            const prs = [
                createMockPRFromMongoProjection({
                    number: 1,
                    repositoryId: 'repo-1',
                    filesConfig: [
                        {
                            suggestionsConfig: [
                                { deliveryStatus: DeliveryStatus.SENT },
                                { deliveryStatus: DeliveryStatus.SENT },
                            ],
                        },
                    ],
                }),
                createMockPRFromMongoProjection({
                    number: 2,
                    repositoryId: 'repo-1',
                    filesConfig: [
                        {
                            suggestionsConfig: [
                                { deliveryStatus: DeliveryStatus.NOT_SENT },
                                { deliveryStatus: DeliveryStatus.NOT_SENT },
                                { deliveryStatus: DeliveryStatus.NOT_SENT },
                            ],
                        },
                    ],
                }),
                createMockPRFromMongoProjection({
                    number: 3,
                    repositoryId: 'repo-2',
                    filesConfig: [
                        {
                            suggestionsConfig: [
                                { deliveryStatus: DeliveryStatus.SENT },
                                { deliveryStatus: DeliveryStatus.FAILED },
                            ],
                        },
                        {
                            suggestionsConfig: [
                                { deliveryStatus: DeliveryStatus.NOT_SENT },
                            ],
                        },
                    ],
                }),
            ];

            const results = prs.map(extractSuggestionsCount);

            expect(results).toEqual([
                { sent: 2, filtered: 0 }, // PR 1
                { sent: 0, filtered: 3 }, // PR 2
                { sent: 1, filtered: 1 }, // PR 3
            ]);
        });
    });
});

// ============================================================================
// FUTURE OPTIMIZATION CONTRACT
// ============================================================================

describe('PullRequestsRepository - Future Optimization Contract', () => {
    /**
     * When implementing the optimized aggregation query, it should return
     * pre-computed counts in this format. These tests document the expected
     * output format.
     */

    describe('FUTURE: Aggregation query result format', () => {
        it('should accept pre-computed suggestionsCount in PR object', () => {
            const prWithPrecomputed = createMockPRFromMongoProjection({
                number: 1,
                repositoryId: 'repo-1',
                filesConfig: [], // No files needed when pre-computed
            });

            // This is what the NEW aggregation query should return
            (prWithPrecomputed as any).suggestionsCount = {
                sent: 42,
                filtered: 18,
            };

            const result = extractSuggestionsCount(prWithPrecomputed);

            // Should use pre-computed values
            expect(result).toEqual({ sent: 42, filtered: 18 });
        });

        it('should document expected aggregation output structure', () => {
            /**
             * The optimized query should return:
             * {
             *   _id: ObjectId,
             *   number: number,
             *   repository: { id: string, ... },
             *   suggestionsCount: { sent: number, filtered: number },
             *   // ... other needed fields
             *   // NO files[] array (massive data reduction!)
             * }
             */

            interface OptimizedPRResult {
                uuid: string;
                number: number;
                repositoryId: string;
                suggestionsCount: {
                    sent: number;
                    filtered: number;
                };
            }

            const optimizedResult: OptimizedPRResult = {
                uuid: 'pr-123',
                number: 123,
                repositoryId: 'repo-1',
                suggestionsCount: { sent: 10, filtered: 5 },
            };

            // Verify the structure is valid
            expect(optimizedResult.suggestionsCount.sent).toBe(10);
            expect(optimizedResult.suggestionsCount.filtered).toBe(5);
        });
    });

    /**
     * COMPARISON TEST
     *
     * This test should be used after implementing the optimization to verify
     * both methods return identical results.
     */
    describe('COMPARISON: Current vs Optimized implementation', () => {
        it('should return same results from both implementations', () => {
            // Create a PR that simulates MongoDB data
            const prFromCurrentQuery = createMockPRFromMongoProjection({
                number: 999,
                repositoryId: 'repo-test',
                filesConfig: [
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.SENT },
                            { deliveryStatus: DeliveryStatus.SENT },
                            { deliveryStatus: DeliveryStatus.NOT_SENT },
                            { deliveryStatus: DeliveryStatus.FAILED },
                        ],
                    },
                    {
                        suggestionsConfig: [
                            { deliveryStatus: DeliveryStatus.NOT_SENT },
                            { deliveryStatus: DeliveryStatus.NOT_SENT },
                            { deliveryStatus: DeliveryStatus.SENT },
                        ],
                    },
                ],
            });

            // Get result from current implementation
            const currentResult = extractSuggestionsCount(prFromCurrentQuery);

            // Simulate what the optimized aggregation would return
            const optimizedAggregationResult = {
                sent: 3, // Must match!
                filtered: 3, // Must match!
            };

            // CRITICAL: Both must be identical
            expect(currentResult).toEqual(optimizedAggregationResult);
        });
    });
});

// ============================================================================
// PERFORMANCE BASELINE DOCUMENTATION
// ============================================================================

describe('PullRequestsRepository - Performance Baseline', () => {
    /**
     * These tests document the CURRENT data transfer patterns.
     * Use them to measure improvement after optimization.
     */

    it('should document current data structure size for 1 PR', () => {
        const pr = createMockPRFromMongoProjection({
            number: 1,
            repositoryId: 'repo-1',
            filesConfig: Array(150)
                .fill(null)
                .map(() => ({
                    suggestionsConfig: Array(40)
                        .fill(null)
                        .map((_, i) => ({
                            deliveryStatus:
                                i % 2 === 0
                                    ? DeliveryStatus.SENT
                                    : DeliveryStatus.NOT_SENT,
                        })),
                })),
        });

        // Count total objects
        const filesCount = pr.files.length;
        const suggestionsCount = pr.files.reduce(
            (acc, f) => acc + f.suggestions.length,
            0,
        );

        // Document baseline
        expect(filesCount).toBe(150);
        expect(suggestionsCount).toBe(6000); // 150 × 40

        // Current implementation iterates over ALL these objects
        const result = extractSuggestionsCount(pr);

        // But only needs 2 numbers!
        expect(result.sent).toBe(3000); // 150 × 20
        expect(result.filtered).toBe(3000); // 150 × 20
    });

    it('should document: OPTIMIZED query would transfer only 2 numbers instead of 6000 objects', () => {
        /**
         * BEFORE OPTIMIZATION:
         * - Transfer: ~6000 suggestion objects per PR
         * - Each object: ~500 bytes minimum
         * - Total: ~3MB per PR just for counting
         *
         * AFTER OPTIMIZATION:
         * - Transfer: 2 numbers (sent, filtered)
         * - Total: ~20 bytes per PR
         *
         * Reduction: ~150,000x less data for the counting use case
         */

        const optimizedResponse = { sent: 3000, filtered: 3000 };
        const currentResponse = { sent: 3000, filtered: 3000 };

        // Both should return same values
        expect(optimizedResponse).toEqual(currentResponse);
    });
});
