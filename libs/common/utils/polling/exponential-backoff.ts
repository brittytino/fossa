/**
 * Configuration options for backoff calculation
 */
export interface BackoffOptions {
    /**
     * Base interval in milliseconds
     * @default 1000
     */
    baseInterval?: number;

    /**
     * Maximum interval cap in milliseconds
     * @default 30000
     */
    maxInterval?: number;

    /**
     * Jitter percentage (0-1). Default is 0.25 (±25%)
     * Set to 0 to disable jitter (useful for testing)
     * @default 0.25
     */
    jitterFactor?: number;

    /**
     * Backoff multiplier
     * - 1 = Linear (5s, 10s, 15s, 20s...)
     * - 2 = Exponential (1s, 2s, 4s, 8s, 16s...)
     * - 3 = Aggressive exponential (1s, 3s, 9s, 27s...)
     * @default 2
     */
    multiplier?: number;
}

/**
 * Result of backoff calculation with metadata
 */
export interface BackoffResult {
    /** Final interval in milliseconds (with jitter applied) */
    interval: number;
    /** Base interval without jitter */
    baseInterval: number;
    /** Jitter amount applied */
    jitter: number;
    /** Whether interval hit the cap */
    capped: boolean;
    /** Strategy used */
    strategy: 'linear' | 'exponential';
}

/**
 * Validate backoff options
 * @throws Error if options are invalid
 */
function validateOptions(
    attempt: number,
    options: Required<BackoffOptions>,
): void {
    if (attempt < 0) {
        throw new Error('Attempt number must be non-negative');
    }
    if (options.baseInterval <= 0) {
        throw new Error('Base interval must be positive');
    }
    if (options.maxInterval < options.baseInterval) {
        throw new Error('Max interval must be >= base interval');
    }
    if (options.jitterFactor < 0 || options.jitterFactor > 1) {
        throw new Error('Jitter factor must be between 0 and 1');
    }
    if (options.multiplier < 1) {
        throw new Error('Multiplier must be >= 1');
    }
}

/**
 * Calculate backoff interval WITHOUT jitter (deterministic, good for testing)
 */
export function calculateBackoffIntervalExact(
    attempt: number,
    options: BackoffOptions = {},
): number {
    return calculateBackoffInterval(attempt, { ...options, jitterFactor: 0 });
}

/**
 * Calculate backoff with detailed metadata (useful for debugging/testing)
 */
export function calculateBackoffWithMetadata(
    attempt: number,
    options: BackoffOptions = {},
): BackoffResult {
    const opts: Required<BackoffOptions> = {
        baseInterval: options.baseInterval ?? 1000,
        maxInterval: options.maxInterval ?? 30000,
        jitterFactor: options.jitterFactor ?? 0.25,
        multiplier: options.multiplier ?? 2,
    };

    validateOptions(attempt, opts);

    // Calculate base interval
    const strategy: 'linear' | 'exponential' =
        opts.multiplier === 1 ? 'linear' : 'exponential';

    const rawInterval =
        strategy === 'linear'
            ? opts.baseInterval * (attempt + 1)
            : opts.baseInterval * Math.pow(opts.multiplier, attempt);

    const cappedBaseInterval = Math.min(rawInterval, opts.maxInterval);
    const capped = rawInterval > opts.maxInterval;

    // Calculate jitter
    const jitterRange = cappedBaseInterval * opts.jitterFactor;
    const jitter = jitterRange * (Math.random() - 0.5) * 2;

    const finalInterval = Math.max(1, Math.floor(cappedBaseInterval + jitter));

    return {
        interval: finalInterval,
        baseInterval: cappedBaseInterval,
        jitter: Math.floor(jitter),
        capped,
        strategy,
    };
}

/**
 * Calculate exponential backoff interval with optional jitter
 *
 * Simple interface - returns just the interval number.
 * For detailed metadata, use `calculateBackoffWithMetadata()`
 * For deterministic results (testing), use `calculateBackoffIntervalExact()`
 *
 * @param attempt - Current attempt number (0-based)
 * @param options - Backoff configuration options
 * @returns Next wait interval in milliseconds
 *
 * @example
 * // Exponential (default): 1s, 2s, 4s, 8s, 16s, 30s...
 * const interval = calculateBackoffInterval(0); // ~1000ms ±25%
 *
 * @example
 * // Linear: 5s, 10s, 15s, 20s, 25s...
 * const interval = calculateBackoffInterval(2, {
 *   baseInterval: 5000,
 *   multiplier: 1,  // Linear mode
 * }); // ~15000ms ±25%
 *
 * @example
 * // Deterministic (no jitter, good for tests)
 * const interval = calculateBackoffInterval(3, {
 *   jitterFactor: 0, // Exact values
 * }); // Exactly 8000ms
 */
export function calculateBackoffInterval(
    attempt: number,
    options: BackoffOptions = {},
): number {
    return calculateBackoffWithMetadata(attempt, options).interval;
}

/**
 * Create a backoff calculator with pre-configured options
 * Useful when you need to reuse the same configuration multiple times
 *
 * @param options - Default backoff configuration
 * @returns Function that calculates interval for given attempt
 *
 * @example
 * const backoff = createBackoffCalculator({
 *   baseInterval: 500,
 *   maxInterval: 10000,
 * });
 *
 * const interval1 = backoff(0); // 500ms ±25%
 * const interval2 = backoff(1); // 1000ms ±25%
 * const interval3 = backoff(5); // 10000ms ±25% (capped)
 */
export function createBackoffCalculator(
    defaultOptions: BackoffOptions = {},
): (attempt: number, overrides?: BackoffOptions) => number {
    return (attempt: number, overrides?: BackoffOptions) => {
        return calculateBackoffInterval(attempt, {
            ...defaultOptions,
            ...overrides,
        });
    };
}

/**
 * Generate a sequence of backoff intervals (simple version)
 * For detailed sequence with metadata, use `generateBackoffSequenceWithMetadata()`
 *
 * @param maxAttempts - Number of intervals to generate
 * @param options - Backoff configuration
 * @returns Array of intervals in milliseconds
 *
 * @example
 * // With jitter (non-deterministic)
 * const intervals = generateBackoffSequence(5);
 * // [~1000, ~2000, ~4000, ~8000, ~16000]
 *
 * @example
 * // Without jitter (deterministic, good for tests)
 * const intervals = generateBackoffSequence(5, { jitterFactor: 0 });
 * // [1000, 2000, 4000, 8000, 16000]
 *
 * @example
 * // Linear progression
 * const intervals = generateBackoffSequence(5, {
 *   baseInterval: 5000,
 *   multiplier: 1,
 *   jitterFactor: 0,
 * });
 * // [5000, 10000, 15000, 20000, 25000]
 */
export function generateBackoffSequence(
    maxAttempts: number,
    options: BackoffOptions = {},
): number[] {
    if (maxAttempts <= 0) {
        throw new Error('Max attempts must be positive');
    }

    const intervals: number[] = [];
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        intervals.push(calculateBackoffInterval(attempt, options));
    }
    return intervals;
}

/**
 * Generate backoff sequence with detailed metadata (useful for debugging)
 */
export function generateBackoffSequenceWithMetadata(
    maxAttempts: number,
    options: BackoffOptions = {},
): BackoffResult[] {
    if (maxAttempts <= 0) {
        throw new Error('Max attempts must be positive');
    }

    const results: BackoffResult[] = [];
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        results.push(calculateBackoffWithMetadata(attempt, options));
    }
    return results;
}

/**
 * Print backoff sequence to console (useful for debugging/previewing)
 */
export function printBackoffSequence(
    maxAttempts: number,
    options: BackoffOptions = {},
): void {
    const sequence = generateBackoffSequenceWithMetadata(maxAttempts, options);

    console.log('\n📊 Backoff Sequence Preview:\n');
    console.log(`Strategy: ${sequence[0].strategy.toUpperCase()}`);
    console.log(
        `Base: ${options.baseInterval || 1000}ms | Max: ${options.maxInterval || 30000}ms`,
    );
    console.log(
        `Jitter: ±${((options.jitterFactor || 0.25) * 100).toFixed(0)}%\n`,
    );

    sequence.forEach((result, index) => {
        const cappedMarker = result.capped ? ' (CAP)' : '';
        const jitterStr =
            result.jitter !== 0 ? ` (±${Math.abs(result.jitter)}ms)` : '';
        console.log(
            `Attempt ${index}: ${result.interval}ms${jitterStr}${cappedMarker}`,
        );
    });

    console.log('');
}

/**
 * Common backoff presets for different use cases
 */
export const BackoffPresets = {
    /**
     * Fast polling for quick operations (API responses, cache checks)
     * Progression: 100ms, 200ms, 400ms, 800ms, 1.6s, 3.2s (cap)
     */
    FAST: {
        baseInterval: 100,
        maxInterval: 3200,
        jitterFactor: 0.25,
        multiplier: 2,
    } as BackoffOptions,

    /**
     * Standard polling for most use cases
     * Progression: 1s, 2s, 4s, 8s, 16s, 30s (cap)
     */
    STANDARD: {
        baseInterval: 1000,
        maxInterval: 30000,
        jitterFactor: 0.25,
        multiplier: 2,
    } as BackoffOptions,

    /**
     * Aggressive polling for critical operations
     * Progression: 500ms, 1s, 2s, 4s, 8s, 15s (cap)
     */
    AGGRESSIVE: {
        baseInterval: 500,
        maxInterval: 15000,
        jitterFactor: 0.25,
        multiplier: 2,
    } as BackoffOptions,

    /**
     * Conservative polling for long-running tasks
     * Progression: 2s, 6s, 18s, 54s, 60s (cap)
     */
    CONSERVATIVE: {
        baseInterval: 2000,
        maxInterval: 60000,
        jitterFactor: 0.25,
        multiplier: 3,
    } as BackoffOptions,

    /**
     * Linear backoff (truly linear increment)
     * Progression: 5s, 10s, 15s, 20s, 25s, 30s (cap)
     * multiplier=1 triggers linear mode: baseInterval * (attempt + 1)
     */
    LINEAR: {
        baseInterval: 5000,
        maxInterval: 30000,
        jitterFactor: 0.1,
        multiplier: 1, // Linear: 5s, 10s, 15s, 20s...
    } as BackoffOptions,

    /**
     * Heavy task polling for long-running operations
     * Progression: 5s, 10s, 15s, 20s, 25s, 30s, ..., 60s (cap)
     * Uses linear increment without exponential growth
     */
    HEAVY_TASK: {
        baseInterval: 5000,
        maxInterval: 60000,
        jitterFactor: 0.1,
        multiplier: 1, // Linear: 5s, 10s, 15s, 20s... up to 60s
    } as BackoffOptions,
} as const;
