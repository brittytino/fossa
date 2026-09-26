import picomatch from 'picomatch';

/**
 * PERF: Cache for compiled glob matchers.
 *
 * Problem: picomatch compilation is expensive (~0.6% per PR for 150 files × 10 patterns)
 * Solution: Cache compiled matchers by pattern string
 *
 * The cache is bounded by MAX_CACHE_SIZE to prevent memory leaks.
 * Uses simple Map with LRU-like eviction (clear when full).
 */
const MATCHER_CACHE_CASE_SENSITIVE = new Map<string, picomatch.Matcher>();
const MATCHER_CACHE_CASE_INSENSITIVE = new Map<string, picomatch.Matcher>();
const MAX_CACHE_SIZE = 500; // Reasonable limit for glob patterns

/**
 * Gets or creates a cached matcher for a pattern.
 * @param pattern The glob pattern
 * @param caseInsensitive Whether to match case-insensitively
 * @returns Compiled picomatch matcher function
 */
function getCachedMatcher(
    pattern: string,
    caseInsensitive: boolean,
): picomatch.Matcher {
    const cache = caseInsensitive
        ? MATCHER_CACHE_CASE_INSENSITIVE
        : MATCHER_CACHE_CASE_SENSITIVE;

    let matcher = cache.get(pattern);
    if (matcher) {
        return matcher;
    }

    // Evict cache if too large (simple strategy: clear all)
    // In practice, patterns are reused heavily so this rarely triggers
    if (cache.size >= MAX_CACHE_SIZE) {
        cache.clear();
    }

    matcher = picomatch(pattern, {
        dot: true,
        nocase: caseInsensitive,
    });
    cache.set(pattern, matcher);

    return matcher;
}

/**
 * Normalizes a filename for consistent matching across platforms and providers.
 * @param filename The filename to normalize
 * @returns Normalized filename
 */
function normalizeFilename(filename: string): string {
    return (filename || '')
        .replace(/\\/g, '/') // Convert backslashes to forward slashes
        .replace(/^\.\/+/, '') // Remove leading './' segments
        .replace(/^\/+/, ''); // Remove leading '/' so patterns like '.cursor/**' match '/.cursor/**'
}

/**
 * Checks if a file matches any of the provided Glob patterns.
 * @param filename Name of the file to be checked.
 * @param patterns Array of Glob patterns.
 * @returns Boolean indicating whether the file matches any pattern.
 */
export const isFileMatchingGlob = (
    filename: string,
    patterns: string[],
): boolean => {
    if (!patterns || patterns.length === 0) {
        return false;
    }

    const normalizedFilename = normalizeFilename(filename);

    // PERF: Use cached matchers instead of recompiling each time
    // Before: 150 files × 10 patterns = 1,500 compilations per PR
    // After:  10 patterns compiled once, reused for all files
    for (const pattern of patterns) {
        const matcher = getCachedMatcher(pattern, false);
        if (matcher(normalizedFilename)) {
            return true;
        }
    }

    return false;
};

/**
 * Checks if a file matches any of the provided Glob patterns (case-insensitive).
 * Useful for external file references where users might not remember exact casing.
 * @param filename Name of the file to be checked.
 * @param patterns Array of Glob patterns.
 * @returns Boolean indicating whether the file matches any pattern (ignoring case).
 */
export const isFileMatchingGlobCaseInsensitive = (
    filename: string,
    patterns: string[],
): boolean => {
    if (!patterns || patterns.length === 0) {
        return false;
    }

    const normalizedFilename = normalizeFilename(filename);

    for (const pattern of patterns) {
        const matcher = getCachedMatcher(pattern, true);
        if (matcher(normalizedFilename)) {
            return true;
        }
    }

    return false;
};

/**
 * Clears the matcher cache. Useful for testing or memory management.
 * @internal Exported for testing purposes only
 */
export const _clearMatcherCache = (): void => {
    MATCHER_CACHE_CASE_SENSITIVE.clear();
    MATCHER_CACHE_CASE_INSENSITIVE.clear();
};

/**
 * Gets the current cache size. Useful for monitoring.
 * @internal Exported for testing purposes only
 */
export const _getMatcherCacheSize = (): {
    caseSensitive: number;
    caseInsensitive: number;
} => ({
    caseSensitive: MATCHER_CACHE_CASE_SENSITIVE.size,
    caseInsensitive: MATCHER_CACHE_CASE_INSENSITIVE.size,
});
