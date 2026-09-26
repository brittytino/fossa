/**
 * REGRESSION TESTS - glob-utils
 *
 * These tests capture the CURRENT behavior of isFileMatchingGlob.
 * When implementing the matcher cache optimization, these tests ensure
 * behavior remains identical.
 *
 * CRITICAL: Do NOT modify existing tests when implementing cache.
 */

import {
    isFileMatchingGlob,
    isFileMatchingGlobCaseInsensitive,
} from '@/shared/utils/glob-utils';

describe('globMatch', () => {
    it('matches .cursor/rules/**/*.mdc against rule files in tree', () => {
        const pattern = '.cursor/rules/**/*.mdc';
        expect(
            isFileMatchingGlob('.cursor/rules/accessibility.mdc', [pattern]),
        ).toBe(true);
        expect(
            isFileMatchingGlob('.cursor/rules/animation.mdc', [pattern]),
        ).toBe(true);
        expect(isFileMatchingGlob('.cursor/rules/assets.mdc', [pattern])).toBe(
            true,
        );
        expect(isFileMatchingGlob('.gitignore', [pattern])).toBe(false);
    });

    it('matches when provider returns a leading slash', () => {
        const pattern = '.cursor/rules/**/*.mdc';
        expect(
            isFileMatchingGlob('/.cursor/rules/accessibility.mdc', [pattern]),
        ).toBe(true);
        expect(
            isFileMatchingGlob('/.cursor/rules/sub/dir/file.mdc', [pattern]),
        ).toBe(true);
    });

    it('matches nested folders with **', () => {
        const pattern = '.cursor/rules/**/*.mdc';
        expect(
            isFileMatchingGlob('.cursor/rules/sub/dir/file.mdc', [pattern]),
        ).toBe(true);
        expect(
            isFileMatchingGlob('.cursor/rules/subdir/file.txt', [pattern]),
        ).toBe(false);
    });

    it('matches exact files and directories', () => {
        expect(isFileMatchingGlob('.cursorrules', ['.cursorrules'])).toBe(true);
        expect(isFileMatchingGlob('CLAUDE.md', ['CLAUDE.md'])).toBe(true);
        expect(
            isFileMatchingGlob('docs/coding-standards/guide.md', [
                'docs/coding-standards/**/*',
            ]),
        ).toBe(true);
    });

    it('does not let single * cross directory boundaries', () => {
        expect(isFileMatchingGlob('docs/a.md', ['docs/*'])).toBe(true);
        expect(isFileMatchingGlob('docs/a/b.md', ['docs/*'])).toBe(false);
    });

    it('supports character class and ? wildcard', () => {
        expect(isFileMatchingGlob('file-a.md', ['file-[ab].md'])).toBe(true);
        expect(isFileMatchingGlob('file-b.md', ['file-[ab].md'])).toBe(true);
        expect(isFileMatchingGlob('file-c.md', ['file-[ab].md'])).toBe(false);
        expect(isFileMatchingGlob('a.md', ['?.md'])).toBe(true);
        expect(isFileMatchingGlob('ab.md', ['?.md'])).toBe(false);
    });

    it('supports brace expansion for extensions', () => {
        expect(isFileMatchingGlob('src/app.ts', ['src/**/*.{ts,js}'])).toBe(
            true,
        );
        expect(isFileMatchingGlob('src/app.js', ['src/**/*.{ts,js}'])).toBe(
            true,
        );
        expect(isFileMatchingGlob('src/app.jsx', ['src/**/*.{ts,js}'])).toBe(
            false,
        );
    });

    it('matches dotfiles when pattern includes a dotfile', () => {
        expect(isFileMatchingGlob('.aiderignore', ['.aiderignore'])).toBe(true);
        expect(isFileMatchingGlob('.aider.conf.yml', ['.aider.conf.yml'])).toBe(
            true,
        );
        expect(
            isFileMatchingGlob('.github/copilot-instructions.md', [
                '.github/copilot-instructions.md',
            ]),
        ).toBe(true);
    });

    it('matches more repository rule patterns', () => {
        expect(
            isFileMatchingGlob('.sourcegraph/rules/one.rule.md', [
                '.sourcegraph/**/*.rule.md',
            ]),
        ).toBe(true);
        expect(
            isFileMatchingGlob('.rules/backend/security.md', ['.rules/**/*']),
        ).toBe(true);
        expect(isFileMatchingGlob('.fossy/rules.json', ['.fossy/**/*'])).toBe(
            true,
        );
        expect(isFileMatchingGlob('.windsurfrules', ['.windsurfrules'])).toBe(
            true,
        );
    });
});

// ============================================================================
// REGRESSION TESTS FOR CACHE OPTIMIZATION
// ============================================================================

describe('globMatch - REGRESSION: Cache optimization safety', () => {
    /**
     * These tests ensure that when we implement matcher caching,
     * the results remain identical to the current implementation.
     */

    describe('REGRESSION: Same pattern, multiple files', () => {
        /**
         * Key scenario: Same pattern used for many files.
         * Current: Pattern is recompiled for each file.
         * Optimized: Pattern is compiled once and cached.
         *
         * Results MUST be identical.
         */
        it('should return consistent results for same pattern across many files', () => {
            const patterns = ['**/*.ts', '**/*.spec.ts'];
            const files = [
                'src/index.ts',
                'src/app.ts',
                'src/utils/helper.ts',
                'src/utils/helper.spec.ts',
                'test/app.spec.ts',
                'package.json',
                'README.md',
                'src/styles/main.css',
            ];

            const results = files.map((file) => ({
                file,
                matches: isFileMatchingGlob(file, patterns),
            }));

            expect(results).toEqual([
                { file: 'src/index.ts', matches: true },
                { file: 'src/app.ts', matches: true },
                { file: 'src/utils/helper.ts', matches: true },
                { file: 'src/utils/helper.spec.ts', matches: true },
                { file: 'test/app.spec.ts', matches: true },
                { file: 'package.json', matches: false },
                { file: 'README.md', matches: false },
                { file: 'src/styles/main.css', matches: false },
            ]);
        });

        it('should handle ignore patterns consistently across many files', () => {
            // Common ignore patterns from .kodeignore files
            // Note: *.lock matches files ending in .lock (yarn.lock, pnpm-lock.yaml)
            // NOT package-lock.json which ends in .json
            const ignorePatterns = [
                'node_modules/**',
                '*.lock', // Matches yarn.lock, pnpm-lock.yaml, NOT package-lock.json
                '*-lock.json', // Matches package-lock.json
                'dist/**',
                '.git/**',
                '**/*.min.js',
                'coverage/**',
            ];

            const files = [
                'node_modules/lodash/index.js',
                'node_modules/react/package.json',
                'package-lock.json',
                'yarn.lock',
                'dist/bundle.js',
                'dist/index.html',
                '.git/HEAD',
                '.git/config',
                'src/vendor/lib.min.js',
                'assets/scripts/app.min.js',
                'coverage/lcov.info',
                'src/index.ts', // Should NOT match
                'README.md', // Should NOT match
            ];

            const results = files.map((file) => ({
                file,
                shouldIgnore: isFileMatchingGlob(file, ignorePatterns),
            }));

            expect(results).toEqual([
                { file: 'node_modules/lodash/index.js', shouldIgnore: true },
                { file: 'node_modules/react/package.json', shouldIgnore: true },
                { file: 'package-lock.json', shouldIgnore: true },
                { file: 'yarn.lock', shouldIgnore: true },
                { file: 'dist/bundle.js', shouldIgnore: true },
                { file: 'dist/index.html', shouldIgnore: true },
                { file: '.git/HEAD', shouldIgnore: true },
                { file: '.git/config', shouldIgnore: true },
                { file: 'src/vendor/lib.min.js', shouldIgnore: true },
                { file: 'assets/scripts/app.min.js', shouldIgnore: true },
                { file: 'coverage/lcov.info', shouldIgnore: true },
                { file: 'src/index.ts', shouldIgnore: false },
                { file: 'README.md', shouldIgnore: false },
            ]);
        });
    });

    describe('REGRESSION: Large scale scenarios (performance baseline)', () => {
        /**
         * Documents the scenario from the performance report:
         * 150 files × 10 patterns = 1,500 compilations per PR
         *
         * After optimization: 10 compilations (cached)
         */
        it('should correctly filter 150 files against 10 patterns', () => {
            const patterns = [
                'node_modules/**',
                '**/*.lock',
                'dist/**',
                '.git/**',
                '**/*.min.js',
                'coverage/**',
                '**/*.map',
                'build/**',
                'tmp/**',
                '**/*.log',
            ];

            // Generate 150 files
            const files: string[] = [];
            for (let i = 0; i < 50; i++) {
                files.push(`src/module${i}/index.ts`);
                files.push(`src/module${i}/utils.ts`);
                files.push(`src/module${i}/types.ts`);
            }

            // Process all files
            const matchingFiles = files.filter(
                (file) => !isFileMatchingGlob(file, patterns),
            );

            // None should be ignored (they're all src/*.ts)
            expect(matchingFiles.length).toBe(150);
        });

        it('should maintain correctness for realistic mixed file set', () => {
            const patterns = [
                'node_modules/**',
                '**/*.lock', // Matches files ending in .lock
                '*-lock.json', // Matches package-lock.json
                'dist/**',
                '.git/**',
            ];

            const files = [
                // Should NOT be ignored (50 files)
                ...Array.from({ length: 50 }, (_, i) => `src/file${i}.ts`),
                // Should be ignored
                'node_modules/pkg/index.js',
                'dist/main.js',
                '.git/config',
                'package-lock.json',
            ];

            const notIgnored = files.filter(
                (file) => !isFileMatchingGlob(file, patterns),
            );

            expect(notIgnored.length).toBe(50);
            expect(notIgnored.every((f) => f.startsWith('src/'))).toBe(true);
        });
    });

    describe('REGRESSION: Edge cases that cache must handle', () => {
        it('should handle empty patterns array', () => {
            expect(isFileMatchingGlob('any-file.ts', [])).toBe(false);
        });

        it('should handle empty filename', () => {
            expect(isFileMatchingGlob('', ['**/*.ts'])).toBe(false);
        });

        it('should handle patterns with special regex characters', () => {
            // These should be treated as glob patterns, not regex
            expect(isFileMatchingGlob('file.ts', ['file.ts'])).toBe(true);
            expect(isFileMatchingGlob('file+plus.ts', ['file+plus.ts'])).toBe(
                true,
            );
            expect(isFileMatchingGlob('file[0].ts', ['file[0].ts'])).toBe(true);
        });

        it('should handle multiple matching patterns (any match = true)', () => {
            const patterns = ['*.ts', '*.js', '*.tsx'];

            expect(isFileMatchingGlob('file.ts', patterns)).toBe(true);
            expect(isFileMatchingGlob('file.js', patterns)).toBe(true);
            expect(isFileMatchingGlob('file.tsx', patterns)).toBe(true);
            expect(isFileMatchingGlob('file.css', patterns)).toBe(false);
        });
    });
});

// ============================================================================
// CASE INSENSITIVE REGRESSION TESTS
// ============================================================================

describe('globMatch - isFileMatchingGlobCaseInsensitive', () => {
    describe('REGRESSION: Case insensitive matching', () => {
        it('should match regardless of case', () => {
            const patterns = ['README.md', 'src/**/*.ts'];

            expect(
                isFileMatchingGlobCaseInsensitive('readme.md', patterns),
            ).toBe(true);
            expect(
                isFileMatchingGlobCaseInsensitive('README.MD', patterns),
            ).toBe(true);
            expect(
                isFileMatchingGlobCaseInsensitive('ReadMe.Md', patterns),
            ).toBe(true);
            expect(
                isFileMatchingGlobCaseInsensitive('SRC/App.TS', patterns),
            ).toBe(true);
            expect(
                isFileMatchingGlobCaseInsensitive(
                    'Src/Utils/Helper.Ts',
                    patterns,
                ),
            ).toBe(true);
        });

        it('should be consistent with case-sensitive version for lowercase', () => {
            const patterns = ['src/**/*.ts'];
            const file = 'src/index.ts';

            // Both should return true for lowercase
            expect(isFileMatchingGlob(file, patterns)).toBe(true);
            expect(isFileMatchingGlobCaseInsensitive(file, patterns)).toBe(
                true,
            );
        });
    });
});

// ============================================================================
// SNAPSHOT TESTS FOR CACHE VALIDATION
// ============================================================================

describe('globMatch - Behavior Snapshots for Cache Validation', () => {
    /**
     * Deterministic scenarios that can be run before and after cache
     * implementation to verify identical behavior.
     */

    const SNAPSHOT_SCENARIOS = [
        {
            name: 'typescript_source_files',
            patterns: ['**/*.ts', '!**/*.spec.ts', '!**/*.test.ts'],
            files: [
                { path: 'src/index.ts', expected: true },
                { path: 'src/app.spec.ts', expected: true }, // Note: negation needs special handling
                { path: 'lib/utils.ts', expected: true },
            ],
        },
        {
            name: 'common_ignore_patterns',
            patterns: ['node_modules/**', 'dist/**', '*.log'],
            files: [
                { path: 'node_modules/lodash/index.js', expected: true },
                { path: 'dist/bundle.js', expected: true },
                { path: 'error.log', expected: true },
                { path: 'src/app.ts', expected: false },
            ],
        },
        {
            name: 'extension_matching',
            patterns: ['**/*.{ts,tsx,js,jsx}'],
            files: [
                { path: 'src/app.ts', expected: true },
                { path: 'src/App.tsx', expected: true },
                { path: 'lib/utils.js', expected: true },
                { path: 'components/Button.jsx', expected: true },
                { path: 'styles/main.css', expected: false },
                { path: 'README.md', expected: false },
            ],
        },
    ];

    SNAPSHOT_SCENARIOS.forEach(({ name, patterns, files }) => {
        describe(`SNAPSHOT: ${name}`, () => {
            files.forEach(({ path, expected }) => {
                it(`${path} should ${expected ? 'match' : 'NOT match'}`, () => {
                    expect(isFileMatchingGlob(path, patterns)).toBe(expected);
                });
            });
        });
    });
});
