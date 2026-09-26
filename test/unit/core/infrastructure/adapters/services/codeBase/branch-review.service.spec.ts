import {
    processExpression,
    validateExpression,
    convertConfigToExpression,
    shouldReviewBranches,
} from '@/core/infrastructure/adapters/services/codeBase/branchReview.service';

describe('Branch Review Functions', () => {
    describe('processExpression', () => {
        it('should process simple inclusion expressions', () => {
            const expression = 'feature/aggregation';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        'feature/aggregation': true,
                    },
                },
            });
        });

        it('should process exclusion expressions', () => {
            const expression = '!develop, !main';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        '!develop': false,
                        '!main': false,
                    },
                },
            });
        });

        it('should process wildcard expressions', () => {
            const expression = 'feature/*, !release/*';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        '!release/*': false,
                        'feature/*': true,
                    },
                },
            });
        });

        it('should process contains expressions', () => {
            const expression = 'contains:demo, contains:hotfix';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    'contains:demo': { '*': true },
                    'contains:hotfix': { '*': true },
                },
            });
        });

        it('should process exact match expressions', () => {
            const expression = '=main, !==develop';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        'main': true,
                        '!==develop': false,
                    },
                },
            });
        });

        it('should process complex expressions', () => {
            const expression =
                'feature/aggregation, !develop, !main, !release/*';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        '!develop': false,
                        '!main': false,
                        '!release/*': false,
                        'feature/aggregation': true,
                    },
                },
            });
        });

        it('should handle empty expressions', () => {
            const config = processExpression('');
            expect(config).toEqual({ reviewRules: {} });
        });

        it('should handle expressions with extra spaces', () => {
            const expression = ' feature/aggregation , !develop , !main ';
            const config = processExpression(expression);

            expect(config).toEqual({
                reviewRules: {
                    '*': {
                        '!develop': false,
                        '!main': false,
                        'feature/aggregation': true,
                    },
                },
            });
        });
    });

    describe('validateExpression', () => {
        it('should validate correct expressions', () => {
            const expression = 'feature/aggregation, !develop, !main';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should detect empty exclusion rules', () => {
            const expression = 'feature/aggregation, !';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Rule 2 is invalid: "!" cannot be empty',
            );
        });

        it('should detect empty exact match rules', () => {
            const expression = 'feature/aggregation, =';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Rule 2 is invalid: "=" cannot be empty',
            );
        });

        it('should detect empty contains rules', () => {
            const expression = 'feature/aggregation, contains:';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Rule 2 is invalid: "contains:" cannot be empty',
            );
        });

        it('should detect rules exceeding character limit', () => {
            const longRule = 'a'.repeat(101);
            const expression = `feature/aggregation, ${longRule}`;
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Rule 2 exceeds 100 characters');
        });

        it('should detect invalid characters', () => {
            const expression = 'feature/aggregation, feature@#$%';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Rule 2 contains invalid characters: "feature@#$%"',
            );
        });

        it('should detect double wildcards', () => {
            const expression = 'feature/aggregation, feature/**';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Rule 2 is invalid: "**" is not allowed',
            );
        });

        it('should detect duplicate rules', () => {
            const expression = 'feature/aggregation, feature/aggregation';
            const result = validateExpression(expression);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Duplicate rules found');
        });

        it('should validate empty expressions', () => {
            const result = validateExpression('');
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe('convertConfigToExpression', () => {
        it('should convert simple config back to expression', () => {
            const config = {
                reviewRules: {
                    'feature/aggregation': { '*': true },
                },
            };

            const expression = convertConfigToExpression(config);
            expect(expression).toBe('feature/aggregation');
        });

        it('should convert exclusion config back to expression', () => {
            const config = {
                reviewRules: {
                    '*': {
                        '!develop': false,
                        '!main': false,
                    },
                },
            };

            const expression = convertConfigToExpression(config);
            expect(expression).toBe('!develop, !main');
        });

        it('should convert complex config back to expression', () => {
            const config = {
                reviewRules: {
                    'feature/aggregation': { '*': true },
                    '*': {
                        '!develop': false,
                        '!main': false,
                    },
                    '!release/*': { '*': false },
                },
            };

            const expression = convertConfigToExpression(config);
            expect(expression).toBe(
                'feature/aggregation, !develop, !main, !release/*',
            );
        });

        it('should handle empty config', () => {
            const expression = convertConfigToExpression({});
            expect(expression).toBe('');
        });
    });

    describe('shouldReviewBranches', () => {
        describe('Integration with processExpression', () => {
            it('should work end-to-end with user configuration', () => {
                // User configuration: "feature/aggregation, !develop, !main, !release/*"
                const expression =
                    'feature/aggregation, !develop, !main, !release/*';
                const config = processExpression(expression);

                // Test cases
                // feature/xyz → feature/aggregation should be true (any branch can go to feature/aggregation)
                expect(
                    shouldReviewBranches(
                        'feature/xyz',
                        'feature/aggregation',
                        config,
                    ),
                ).toBe(true);

                // feature/xyz → develop should be false (matches * → !develop)
                expect(
                    shouldReviewBranches('feature/xyz', 'develop', config),
                ).toBe(false);

                // feature/xyz → main should be false (matches * → !main)
                expect(
                    shouldReviewBranches('feature/xyz', 'main', config),
                ).toBe(false);

                // feature/xyz → staging should be false (no matching rule)
                expect(
                    shouldReviewBranches('feature/xyz', 'staging', config),
                ).toBe(false);

                // release/1.0 → develop should be false (matches !release/* → *)
                expect(
                    shouldReviewBranches('release/1.0', 'develop', config),
                ).toBe(false);

                // hotfix/xyz → develop should be false (matches * → !develop)
                expect(
                    shouldReviewBranches('hotfix/xyz', 'develop', config),
                ).toBe(false);
            });

            it('should work with GitFlow configuration', () => {
                const expression = 'feature/*, hotfix/*';
                const config = processExpression(expression);

                // feature/* and hotfix/* are target patterns - any branch can go to them
                expect(
                    shouldReviewBranches('develop', 'feature/xyz', config),
                ).toBe(true);
                expect(shouldReviewBranches('main', 'hotfix/xyz', config)).toBe(
                    true,
                );
                expect(
                    shouldReviewBranches('main', 'feature/xyz', config),
                ).toBe(true);
            });

            it('should work with GitHub Flow configuration', () => {
                const expression = 'feature/*, hotfix/*, !main';
                const config = processExpression(expression);

                // feature/* and hotfix/* are target patterns, but !main excludes main
                expect(shouldReviewBranches('develop', 'main', config)).toBe(
                    false,
                );
                expect(
                    shouldReviewBranches('develop', 'feature/xyz', config),
                ).toBe(true);
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty config', () => {
                const result = shouldReviewBranches('feature/xyz', 'develop', {
                    reviewRules: {},
                });
                expect(result).toBe(false);
            });

            it('should handle config without reviewRules', () => {
                const result = shouldReviewBranches(
                    'feature/xyz',
                    'develop',
                    {},
                );
                expect(result).toBe(false);
            });

            it('should handle invalid patterns gracefully', () => {
                const result = shouldReviewBranches('feature/xyz', 'develop', {
                    reviewRules: {
                        'invalid[pattern': { '*': true },
                    },
                });
                expect(result).toBe(false);
            });

            it('should handle null/undefined branches', () => {
                const result = shouldReviewBranches(null as any, 'develop', {
                    reviewRules: { '*': { '*': true } },
                });
                expect(result).toBe(false);
            });
        });

        describe('Complex Scenarios', () => {
            it('should handle advanced regex patterns', () => {
                const advancedConfig = {
                    reviewRules: {
                        'feature/*': { '*': true },
                        'release/*': { '*': true },
                        '!hotfix-*': { '*': false },
                        'contains:demo': { '*': true },
                    },
                };

                // Test wildcards with special characters - feature/* means any branch matching can go anywhere
                expect(
                    shouldReviewBranches(
                        'feature/v1.0',
                        'develop',
                        advancedConfig,
                    ),
                ).toBe(true);
                expect(
                    shouldReviewBranches(
                        'release/v2.0',
                        'main',
                        advancedConfig,
                    ),
                ).toBe(true);

                // Test exclusion with wildcards - !hotfix-* means any branch matching cannot go anywhere
                expect(
                    shouldReviewBranches(
                        'hotfix-urgent',
                        'main',
                        advancedConfig,
                    ),
                ).toBe(false);

                // Test contains - contains:demo means any branch containing "demo" can go anywhere
                expect(
                    shouldReviewBranches(
                        'feature/demo-xyz',
                        'develop',
                        advancedConfig,
                    ),
                ).toBe(true);
            });

            it('should handle multiple wildcard rules', () => {
                const wildcardConfig = {
                    reviewRules: {
                        '*': {
                            '*': true, // Allow everything by default
                            '!main': false, // But exclude main
                        },
                        'feature/*': {
                            '*': true, // Feature branches can go anywhere
                        },
                    },
                };

                // Should match feature/* → * (higher specificity)
                expect(
                    shouldReviewBranches(
                        'feature/xyz',
                        'develop',
                        wildcardConfig,
                    ),
                ).toBe(true);

                // Should NOT match because * → !main has higher priority than feature/* → *
                expect(
                    shouldReviewBranches('feature/xyz', 'main', wildcardConfig),
                ).toBe(false);

                // Test with a branch that matches * but not feature/*
                expect(
                    shouldReviewBranches('hotfix/xyz', 'main', wildcardConfig),
                ).toBe(false); // Should be false because * → !main has higher specificity
            });

            it('should prioritize specific rules over wildcard rules', () => {
                const priorityConfig = {
                    reviewRules: {
                        '*': {
                            '*': true, // Default: allow everything
                        },
                        'feature/*': {
                            '*': true, // Feature branches can go anywhere
                        },
                    },
                };

                expect(
                    shouldReviewBranches(
                        'feature/xyz',
                        'develop',
                        priorityConfig,
                    ),
                ).toBe(true);
                expect(
                    shouldReviewBranches('feature/xyz', 'main', priorityConfig),
                ).toBe(true);
            });

            it('should handle granular control by source and target branches', () => {
                // Configuration: features-A1 allowed, features-A2 denied, main excluded
                const expression =
                    'features-A1, features-A1*, !features-A2, !features-A2*, !main';
                const config = processExpression(expression);

                // features-A1 (ALLOWED)
                expect(
                    shouldReviewBranches(
                        'features-A1-abc',
                        'features-A1',
                        config,
                    ),
                ).toBe(true);
                expect(
                    shouldReviewBranches(
                        'features-A1-xyz',
                        'features-A1',
                        config,
                    ),
                ).toBe(true);

                // features-A2 (DENIED)
                expect(
                    shouldReviewBranches(
                        'features-A2-abc',
                        'features-A2',
                        config,
                    ),
                ).toBe(false);
                expect(
                    shouldReviewBranches(
                        'features-A2-xyz',
                        'features-A2',
                        config,
                    ),
                ).toBe(false);

                // main excluded (should not review)
                expect(
                    shouldReviewBranches('features-A1-abc', 'main', config),
                ).toBe(false);
                expect(
                    shouldReviewBranches('features-A2-abc', 'main', config),
                ).toBe(false);

                // develop not explicitly configured (should NOT review because develop is not in allowed targets)
                expect(
                    shouldReviewBranches('features-A1', 'develop', config),
                ).toBe(false);
                expect(
                    shouldReviewBranches('features-A2', 'develop', config),
                ).toBe(false);
            });

            it('should handle specific source-to-target rules', () => {
                // Configuration with specific source-to-target rules
                const specificConfig = {
                    reviewRules: {
                        'features-A1': {
                            '*': true, // features-A1 can go anywhere
                        },
                        'features-A1*': {
                            '*': true, // features-A1* can go anywhere
                        },
                        '!features-A2': {
                            '*': false, // features-A2 cannot go anywhere
                        },
                        '!features-A2*': {
                            '*': false, // features-A2* cannot go anywhere
                        },
                    },
                };

                // features-A1 specific rules
                expect(
                    shouldReviewBranches(
                        'features-A1',
                        'develop',
                        specificConfig,
                    ),
                ).toBe(true);
                expect(
                    shouldReviewBranches('features-A1', 'main', specificConfig),
                ).toBe(true);

                // features-A1* rules
                expect(
                    shouldReviewBranches(
                        'features-A1-abc',
                        'features-A1',
                        specificConfig,
                    ),
                ).toBe(true);

                // features-A2 denied
                expect(
                    shouldReviewBranches(
                        'features-A2',
                        'develop',
                        specificConfig,
                    ),
                ).toBe(false);
                expect(
                    shouldReviewBranches(
                        'features-A2-abc',
                        'features-A2',
                        specificConfig,
                    ),
                ).toBe(false);
            });
        });
    });
});
