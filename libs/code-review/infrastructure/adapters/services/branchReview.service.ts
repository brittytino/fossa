export interface ReviewConfig {
    reviewRules?: {
        [sourcePattern: string]: {
            [targetPattern: string]: boolean;
        };
    };
}

/**
 * Process a branch expression string into a ReviewConfig
 */
export function processExpression(expression: string): ReviewConfig {
    if (!expression || expression.trim() === '') {
        return { reviewRules: {} };
    }

    const rules = expression
        .split(',')
        .map((rule) => rule.trim())
        .filter((rule) => rule.length > 0);
    const reviewRules: any = {};

    rules.forEach((rule) => {
        if (rule.startsWith('!')) {
            const pattern = rule.slice(1);
            reviewRules['*'] = reviewRules['*'] || {};
            reviewRules['*'][`!${pattern}`] = false;
        } else if (rule.startsWith('=')) {
            const pattern = rule.slice(1);
            reviewRules['*'] = reviewRules['*'] || {};
            reviewRules['*'][pattern] = true;
        } else if (rule.startsWith('!==')) {
            const pattern = rule.slice(3);
            reviewRules['*'] = reviewRules['*'] || {};
            reviewRules['*'][`!${pattern}`] = false;
        } else if (rule.startsWith('contains:')) {
            const pattern = rule;
            reviewRules[pattern] = { '*': true };
        } else {
            if (rule.includes('*')) {
                reviewRules['*'] = reviewRules['*'] || {};
                reviewRules['*'][rule] = true;
            } else {
                reviewRules['*'] = reviewRules['*'] || {};
                reviewRules['*'][rule] = true;
            }
        }
    });

    return { reviewRules };
}

/**
 * Validate a branch expression string
 */
export function validateExpression(expression: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!expression || expression.trim() === '') {
        return { isValid: true, errors: [] };
    }

    const rules = expression
        .split(',')
        .map((rule) => rule.trim())
        .filter((rule) => rule.length > 0);

    // Check for duplicates
    const uniqueRules = new Set(rules);
    if (uniqueRules.size !== rules.length) {
        errors.push('Duplicate rules found');
    }

    rules.forEach((rule, index) => {
        const ruleNumber = index + 1;

        // Check length
        if (rule.length > 100) {
            errors.push(`Rule ${ruleNumber} exceeds 100 characters`);
            return;
        }

        // Check for empty rules
        if (rule === '!' || rule === '=' || rule === 'contains:') {
            errors.push(
                `Rule ${ruleNumber} is invalid: "${rule}" cannot be empty`,
            );
            return;
        }

        // Check for invalid characters (only allow alphanumeric, /, *, -, _, !, =, :)
        const validPattern = /^[a-zA-Z0-9/*\-_!=:]+$/;
        if (!validPattern.test(rule)) {
            errors.push(
                `Rule ${ruleNumber} contains invalid characters: "${rule}"`,
            );
            return;
        }

        // Check for double wildcards
        if (rule.includes('**')) {
            errors.push(`Rule ${ruleNumber} is invalid: "**" is not allowed`);
            return;
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Convert a ReviewConfig back to an expression string
 */
export function convertConfigToExpression(config: ReviewConfig): string {
    if (!config?.reviewRules) {
        return '';
    }

    const rules: string[] = [];

    Object.entries(config.reviewRules).forEach(([sourcePattern, targets]) => {
        Object.entries(targets).forEach(([targetPattern, shouldReview]) => {
            if (sourcePattern === '*') {
                if (targetPattern.startsWith('!')) {
                    rules.push(targetPattern);
                } else if (shouldReview) {
                    rules.push(`=${targetPattern}`);
                } else {
                    rules.push(`!==${targetPattern.slice(1)}`);
                }
            } else {
                if (sourcePattern.startsWith('!')) {
                    rules.push(sourcePattern);
                } else if (sourcePattern.startsWith('contains:')) {
                    rules.push(sourcePattern);
                } else {
                    rules.push(sourcePattern);
                }
            }
        });
    });

    return rules.join(', ');
}

/**
 * Determine if a PR should be processed based on branch patterns
 */
export function shouldReviewBranches(
    baseBranch: string,
    targetBranch: string,
    config: ReviewConfig,
): boolean {
    if (!baseBranch || !targetBranch || !config?.reviewRules) {
        return false;
    }

    const results: { result: boolean; specificity: number }[] = [];

    for (const [sourcePattern, targets] of Object.entries(config.reviewRules)) {
        if (matchesPattern(baseBranch, sourcePattern)) {
            for (const [targetPattern, shouldReview] of Object.entries(
                targets,
            )) {
                if (matchesPattern(targetBranch, targetPattern)) {
                    const specificity = calculateSpecificity(
                        sourcePattern,
                        targetPattern,
                    );
                    results.push({
                        result: shouldReview as boolean,
                        specificity,
                    });
                }
            }
        }
    }

    if (results.length === 0) {
        return false;
    }

    results.sort((a, b) => b.specificity - a.specificity);
    return results[0].result;
}

/**
 * Check if a branch matches a pattern
 */
function matchesPattern(branch: string, pattern: string): boolean {
    if (!branch || !pattern) {
        return false;
    }

    // Handle exclusions
    if (pattern.startsWith('!')) {
        const exclusionPattern = pattern.slice(1);
        // For exclusions, return true if the branch matches the exclusion pattern
        // This means the exclusion rule applies (and should be denied)
        return matchesPattern(branch, exclusionPattern);
    }

    // Handle contains patterns
    if (pattern.startsWith('contains:')) {
        const substring = pattern.slice(9); // Remove "contains:"
        return branch.includes(substring);
    }

    // Handle wildcards
    if (pattern.includes('*')) {
        const regexPattern = pattern
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
            .replace(/\\\*/g, '.*'); // Convert * to .*
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(branch);
    }

    // Handle exact matches
    return branch === pattern;
}

/**
 * Check if a branch matches an exclusion pattern
 */
function matchesExclusionPattern(branch: string, pattern: string): boolean {
    if (!pattern.startsWith('!')) {
        return false;
    }

    const exclusionPattern = pattern.slice(1);
    return matchesPattern(branch, exclusionPattern);
}

/**
 * Calculate specificity score for rule prioritization
 */
function calculateSpecificity(
    sourcePattern: string,
    targetPattern: string,
): number {
    let score = 0;

    // Source pattern specificity
    if (sourcePattern === '*') {
        score += 1; // Lowest priority
    } else if (sourcePattern.startsWith('!')) {
        score += 15; // Exclusions have very high priority
    } else if (sourcePattern.startsWith('contains:')) {
        score += 5; // Contains patterns have medium priority
    } else if (sourcePattern.includes('*')) {
        score += 8; // Wildcards have high priority
    } else {
        score += 10; // Exact matches have high priority
    }

    // Target pattern specificity - exclusions have MAXIMUM priority
    if (targetPattern.startsWith('!')) {
        score += 100; // Exclusions have MAXIMUM priority to override everything
    } else if (targetPattern === '*') {
        score += 1; // Lowest priority
    } else if (targetPattern.includes('*')) {
        score += 3; // Wildcards have medium-low priority
    } else {
        score += 8; // Exact matches have high priority
    }

    return score;
}

export function mergeBaseBranches(
    configuredBranches: string[],
    apiBaseBranch: string,
): string[] {
    const merged = new Set<string>();
    const exclusions = new Set<string>();
    const inclusions = new Set<string>();

    for (const branch of configuredBranches) {
        if (branch.startsWith('!')) {
            exclusions.add(branch);
        } else {
            inclusions.add(branch);
        }
    }

    if (
        !inclusions.has(apiBaseBranch) &&
        !exclusions.has(`!${apiBaseBranch}`)
    ) {
        inclusions.add(apiBaseBranch);
    }

    for (const inclusion of inclusions) {
        const exclusion = `!${inclusion}`;
        if (!exclusions.has(exclusion)) {
            merged.add(inclusion);
        }
    }

    for (const exclusion of exclusions) {
        const inclusion = exclusion.slice(1); // Remove !
        if (!inclusions.has(inclusion)) {
            merged.add(exclusion);
        }
    }

    return Array.from(merged);
}
