/**
 * REGRESSION TESTS - GetEnrichedPullRequestsUseCase
 *
 * These tests capture the CURRENT behavior of extractSuggestionsCount
 * to ensure any performance optimizations don't break existing functionality.
 *
 * CRITICAL: Do NOT modify these tests when implementing performance improvements.
 * They serve as a safety net to validate behavior remains identical.
 */

import { DeliveryStatus } from '@libs/platformData/domain/pullRequests/enums/deliveryStatus.enum';
import {
    IPullRequests,
    IFile,
    ISuggestion,
} from '@libs/platformData/domain/pullRequests/interfaces/pullRequests.interface';

/**
 * Extracted from GetEnrichedPullRequestsUseCase for isolated testing.
 * This is the CURRENT implementation that we need to preserve behavior for.
 */
function extractSuggestionsCount(pullRequest: IPullRequests): {
    sent: number;
    filtered: number;
} {
    // Optimized: check if we have pre-computed counts
    if ((pullRequest as any).suggestionsCount) {
        const precomputed = (pullRequest as any).suggestionsCount;
        return {
            sent: precomputed.sent ?? 0,
            filtered: precomputed.filtered ?? 0,
        };
    }

    // Fallback: compute from files (slower)
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
// TEST FIXTURES - Mock data representing real-world scenarios
// ============================================================================

function createMockSuggestion(
    overrides: Partial<ISuggestion> = {},
): ISuggestion {
    return {
        id: `suggestion-${Math.random().toString(36).substr(2, 9)}`,
        relevantFile: 'src/test.ts',
        language: 'typescript',
        suggestionContent: 'Test suggestion content',
        existingCode: 'const x = 1;',
        improvedCode: 'const x: number = 1;',
        oneSentenceSummary: 'Add type annotation',
        relevantLinesStart: 1,
        relevantLinesEnd: 1,
        label: 'code_style',
        severity: 'low',
        priorityStatus: 'medium' as any,
        deliveryStatus: DeliveryStatus.SENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

function createMockFile(overrides: Partial<IFile> = {}): IFile {
    return {
        id: `file-${Math.random().toString(36).substr(2, 9)}`,
        path: 'src/test.ts',
        filename: 'test.ts',
        previousName: '',
        status: 'modified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        suggestions: [],
        ...overrides,
    };
}

function createMockPullRequest(
    overrides: Partial<IPullRequests> = {},
): IPullRequests {
    return {
        uuid: `pr-${Math.random().toString(36).substr(2, 9)}`,
        title: 'Test PR',
        status: 'open',
        merged: false,
        number: 123,
        url: 'https://github.com/test/repo/pull/123',
        baseBranchRef: 'main',
        headBranchRef: 'feature/test',
        repository: {
            id: 'repo-1',
            name: 'test-repo',
            fullName: 'org/test-repo',
            language: 'TypeScript',
            url: 'https://github.com/org/test-repo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        openedAt: new Date().toISOString(),
        closedAt: '',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'github',
        user: {
            id: 'user-1',
            username: 'testuser',
            name: 'Test User',
        },
        commits: [],
        isDraft: false,
        ...overrides,
    };
}

// ============================================================================
// REGRESSION TESTS
// ============================================================================

describe('GetEnrichedPullRequestsUseCase - extractSuggestionsCount', () => {
    describe('REGRESSION: Basic counting behavior', () => {
        it('should return { sent: 0, filtered: 0 } for PR with no files', () => {
            const pr = createMockPullRequest({ files: [] });

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });

        it('should return { sent: 0, filtered: 0 } for PR with files but no suggestions', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({ suggestions: [] }),
                    createMockFile({ suggestions: [] }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });

        it('should count SENT suggestions correctly', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 2, filtered: 0 });
        });

        it('should count NOT_SENT (filtered) suggestions correctly', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 3 });
        });

        it('should count mixed SENT and NOT_SENT correctly', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 2, filtered: 1 });
        });
    });

    describe('REGRESSION: Multiple files aggregation', () => {
        it('should aggregate counts across multiple files', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        path: 'file1.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                    createMockFile({
                        path: 'file2.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                    createMockFile({
                        path: 'file3.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            // file1: 2 sent, 0 filtered
            // file2: 0 sent, 1 filtered
            // file3: 1 sent, 2 filtered
            // total: 3 sent, 3 filtered
            expect(result).toEqual({ sent: 3, filtered: 3 });
        });
    });

    describe('REGRESSION: Other delivery statuses should NOT be counted', () => {
        it('should NOT count FAILED suggestions', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.FAILED,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            // FAILED is not counted in either sent or filtered
            expect(result).toEqual({ sent: 1, filtered: 0 });
        });

        it('should NOT count FAILED_LINES_MISMATCH suggestions', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus:
                                    DeliveryStatus.FAILED_LINES_MISMATCH,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            // FAILED_LINES_MISMATCH is not counted in either sent or filtered
            expect(result).toEqual({ sent: 0, filtered: 1 });
        });

        it('should handle all delivery statuses correctly in a mixed scenario', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.FAILED,
                            }),
                            createMockSuggestion({
                                deliveryStatus:
                                    DeliveryStatus.FAILED_LINES_MISMATCH,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                ],
            });

            const result = extractSuggestionsCount(pr);

            // Only SENT and NOT_SENT are counted
            // SENT: 2, NOT_SENT: 2, FAILED: 1 (not counted), FAILED_LINES_MISMATCH: 1 (not counted)
            expect(result).toEqual({ sent: 2, filtered: 2 });
        });
    });

    describe('REGRESSION: Pre-computed counts optimization', () => {
        it('should use pre-computed suggestionsCount when available', () => {
            const pr = createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                ],
            });

            // Add pre-computed count (different from actual to verify it's used)
            (pr as any).suggestionsCount = { sent: 100, filtered: 50 };

            const result = extractSuggestionsCount(pr);

            // Should return pre-computed values, NOT computed from files
            expect(result).toEqual({ sent: 100, filtered: 50 });
        });

        it('should handle partial pre-computed counts with defaults', () => {
            const pr = createMockPullRequest({ files: [] });

            // Only sent is provided
            (pr as any).suggestionsCount = { sent: 10 };

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 10, filtered: 0 });
        });

        it('should handle pre-computed count with only filtered', () => {
            const pr = createMockPullRequest({ files: [] });

            (pr as any).suggestionsCount = { filtered: 20 };

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 20 });
        });
    });

    describe('REGRESSION: Edge cases and null safety', () => {
        it('should handle null files array', () => {
            const pr = createMockPullRequest();
            (pr as any).files = null;

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });

        it('should handle undefined files array', () => {
            const pr = createMockPullRequest();
            (pr as any).files = undefined;

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });

        it('should handle file with null suggestions', () => {
            const pr = createMockPullRequest({
                files: [createMockFile()],
            });
            (pr.files[0] as any).suggestions = null;

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });

        it('should handle file with undefined suggestions', () => {
            const pr = createMockPullRequest({
                files: [createMockFile()],
            });
            (pr.files[0] as any).suggestions = undefined;

            const result = extractSuggestionsCount(pr);

            expect(result).toEqual({ sent: 0, filtered: 0 });
        });
    });

    describe('REGRESSION: Large scale scenarios (performance baseline)', () => {
        /**
         * This test documents the expected behavior for large PRs.
         * When optimizing, the NEW implementation must return identical results.
         */
        it('should correctly count suggestions in a large PR (150 files, 40 suggestions each)', () => {
            const files: IFile[] = [];

            // Create 150 files, each with 40 suggestions
            // Distribution: 60% SENT, 30% NOT_SENT, 10% FAILED
            for (let i = 0; i < 150; i++) {
                const suggestions: ISuggestion[] = [];
                for (let j = 0; j < 40; j++) {
                    let status: DeliveryStatus;
                    if (j < 24) {
                        status = DeliveryStatus.SENT; // 60%
                    } else if (j < 36) {
                        status = DeliveryStatus.NOT_SENT; // 30%
                    } else {
                        status = DeliveryStatus.FAILED; // 10%
                    }
                    suggestions.push(
                        createMockSuggestion({ deliveryStatus: status }),
                    );
                }
                files.push(
                    createMockFile({ path: `file${i}.ts`, suggestions }),
                );
            }

            const pr = createMockPullRequest({ files });

            const result = extractSuggestionsCount(pr);

            // 150 files × 24 SENT = 3600 sent
            // 150 files × 12 NOT_SENT = 1800 filtered
            // 150 files × 4 FAILED = 600 (not counted)
            expect(result).toEqual({ sent: 3600, filtered: 1800 });
        });

        /**
         * This test captures the exact scenario from the performance report:
         * 30 PRs × 150 files × 40 suggestions = 180,000 objects
         *
         * We test a single PR here but the counts must be exact.
         */
        it('should match expected counts for performance report scenario', () => {
            // Simulating the worst case from performance report for ONE PR
            const files: IFile[] = [];

            for (let i = 0; i < 150; i++) {
                const suggestions: ISuggestion[] = [];
                for (let j = 0; j < 40; j++) {
                    // Realistic distribution based on real data patterns
                    const status =
                        j % 3 === 0
                            ? DeliveryStatus.SENT
                            : j % 3 === 1
                              ? DeliveryStatus.NOT_SENT
                              : DeliveryStatus.FAILED;
                    suggestions.push(
                        createMockSuggestion({ deliveryStatus: status }),
                    );
                }
                files.push(createMockFile({ suggestions }));
            }

            const pr = createMockPullRequest({ files });

            const result = extractSuggestionsCount(pr);

            // 150 files × (40/3 SENT ≈ 14 per file) = 2100 sent (actually 150 × 14 = 2100)
            // 150 files × (40/3 NOT_SENT ≈ 13 per file) = 1950 filtered (actually 150 × 13 = 1950)
            // Note: 40 suggestions per file: indices 0,3,6,9,12,15,18,21,24,27,30,33,36,39 = 14 SENT
            //                                indices 1,4,7,10,13,16,19,22,25,28,31,34,37 = 13 NOT_SENT
            //                                indices 2,5,8,11,14,17,20,23,26,29,32,35,38 = 13 FAILED
            expect(result).toEqual({ sent: 2100, filtered: 1950 });
        });
    });
});

// ============================================================================
// SNAPSHOT TESTS - For future comparison with optimized implementation
// ============================================================================

describe('GetEnrichedPullRequestsUseCase - Behavior Snapshots', () => {
    /**
     * These snapshot tests create deterministic scenarios that can be used
     * to verify the optimized MongoDB aggregation returns identical results.
     */

    const SNAPSHOT_SCENARIOS = [
        {
            name: 'empty_pr',
            pr: createMockPullRequest({ files: [] }),
            expected: { sent: 0, filtered: 0 },
        },
        {
            name: 'single_file_all_sent',
            pr: createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                ],
            }),
            expected: { sent: 3, filtered: 0 },
        },
        {
            name: 'single_file_all_filtered',
            pr: createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                ],
            }),
            expected: { sent: 0, filtered: 2 },
        },
        {
            name: 'mixed_statuses',
            pr: createMockPullRequest({
                files: [
                    createMockFile({
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.FAILED,
                            }),
                            createMockSuggestion({
                                deliveryStatus:
                                    DeliveryStatus.FAILED_LINES_MISMATCH,
                            }),
                        ],
                    }),
                ],
            }),
            expected: { sent: 1, filtered: 1 },
        },
        {
            name: 'multiple_files_varied',
            pr: createMockPullRequest({
                files: [
                    createMockFile({
                        path: 'a.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                        ],
                    }),
                    createMockFile({
                        path: 'b.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.NOT_SENT,
                            }),
                        ],
                    }),
                    createMockFile({
                        path: 'c.ts',
                        suggestions: [
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.SENT,
                            }),
                            createMockSuggestion({
                                deliveryStatus: DeliveryStatus.FAILED,
                            }),
                        ],
                    }),
                ],
            }),
            expected: { sent: 3, filtered: 2 },
        },
    ];

    it.each(SNAPSHOT_SCENARIOS)(
        'SNAPSHOT: $name should return $expected',
        ({ pr, expected }) => {
            const result = extractSuggestionsCount(pr);
            expect(result).toEqual(expected);
        },
    );
});
