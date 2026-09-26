import {
    hasFossyMarker,
    hasReviewMarker,
    isForceReviewCommand,
    isHeavyReviewCommand,
    isFossyMentionNonReview,
    isReviewCommand,
    parseReviewDirective,
} from '@libs/common/utils/codeManagement/codeCommentMarkers';

describe('codeCommentMarkers', () => {
    describe('isReviewCommand', () => {
        it('should return true for "@fossy review"', () => {
            expect(isReviewCommand('@fossy review')).toBe(true);
        });

        it('should return true for "@fossy start-review"', () => {
            expect(isReviewCommand('@fossy start-review')).toBe(true);
        });

        it('should return true with leading whitespace', () => {
            expect(isReviewCommand('  @fossy review')).toBe(true);
            expect(isReviewCommand('\t@fossy start-review')).toBe(true);
        });

        it('should return true case-insensitive', () => {
            expect(isReviewCommand('@FOSSY REVIEW')).toBe(true);
            expect(isReviewCommand('@Fossy Start-Review')).toBe(true);
        });

        it('should return true with text after command', () => {
            expect(isReviewCommand('@fossy review please')).toBe(true);
            expect(isReviewCommand('@fossy start-review now')).toBe(true);
        });

        it('should return false for partial matches like "reviewing"', () => {
            expect(isReviewCommand('@fossy reviewing')).toBe(false);
        });

        it('should return false for other @fossy commands', () => {
            expect(isReviewCommand('@fossy help')).toBe(false);
            expect(isReviewCommand('@fossy explain')).toBe(false);
            expect(isReviewCommand('@fossy what is this?')).toBe(false);
        });

        it('should return false when @fossy is not at the start', () => {
            expect(isReviewCommand('hey @fossy review')).toBe(false);
            expect(isReviewCommand('please @fossy start-review')).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(isReviewCommand(null)).toBe(false);
            expect(isReviewCommand(undefined)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(isReviewCommand('')).toBe(false);
        });
    });

    describe('hasReviewMarker', () => {
        it('should return true for standard fossy-codereview marker', () => {
            expect(hasReviewMarker('<!-- fossy-codereview -->')).toBe(true);
        });

        it('should return true with varying whitespace', () => {
            expect(hasReviewMarker('<!--fossy-codereview-->')).toBe(true);
            expect(hasReviewMarker('<!--  fossy-codereview  -->')).toBe(true);
        });

        it('should return true when marker is embedded in text', () => {
            expect(
                hasReviewMarker('Some text <!-- fossy-codereview --> more text'),
            ).toBe(true);
        });

        it('should return true case-insensitive', () => {
            expect(hasReviewMarker('<!-- FOSSY-CODEREVIEW -->')).toBe(true);
            expect(hasReviewMarker('<!-- Fossy-CodeReview -->')).toBe(true);
        });

        it('should return false when marker is not present', () => {
            expect(hasReviewMarker('no marker here')).toBe(false);
            expect(hasReviewMarker('<!-- other-marker -->')).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(hasReviewMarker(null)).toBe(false);
            expect(hasReviewMarker(undefined)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(hasReviewMarker('')).toBe(false);
        });
    });

    describe('isFossyMentionNonReview', () => {
        it('should return true for @fossy with other commands', () => {
            expect(isFossyMentionNonReview('@fossy help')).toBe(true);
            expect(isFossyMentionNonReview('@fossy explain this')).toBe(true);
            expect(isFossyMentionNonReview('@fossy what is this?')).toBe(true);
        });

        it('should return true with leading whitespace', () => {
            expect(isFossyMentionNonReview('  @fossy help')).toBe(true);
        });

        it('should return false for review commands', () => {
            expect(isFossyMentionNonReview('@fossy review')).toBe(false);
            expect(isFossyMentionNonReview('@fossy start-review')).toBe(false);
        });

        it('should return false for review commands case-insensitive', () => {
            expect(isFossyMentionNonReview('@fossy REVIEW')).toBe(false);
            expect(isFossyMentionNonReview('@FOSSY start-review')).toBe(false);
        });

        it('should return false when @fossy is not at the start', () => {
            expect(isFossyMentionNonReview('hey @fossy help')).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(isFossyMentionNonReview(null)).toBe(false);
            expect(isFossyMentionNonReview(undefined)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(isFossyMentionNonReview('')).toBe(false);
        });

        it('should return true for @fossy alone (just mention)', () => {
            expect(isFossyMentionNonReview('@fossy')).toBe(true);
        });
    });

    describe('hasFossyMarker', () => {
        it('should return true for Code Review Completed marker', () => {
            expect(hasFossyMarker('## Code Review Completed! 🔥')).toBe(true);
        });

        it('should return true for critical issue marker', () => {
            expect(
                hasFossyMarker('# Found critical issues please fix them'),
            ).toBe(true);
        });

        it('should return true for @fossy start patterns', () => {
            expect(hasFossyMarker('@fossy start')).toBe(true);
            expect(hasFossyMarker('@fossy start-review')).toBe(true);
        });

        it('should return true for @fossy review pattern', () => {
            expect(hasFossyMarker('@fossy review')).toBe(true);
        });

        it('should return true for fossy without @ prefix', () => {
            expect(hasFossyMarker('fossy start')).toBe(true);
            expect(hasFossyMarker('fossy review')).toBe(true);
        });

        it('should return true for start-review alone', () => {
            expect(hasFossyMarker('start-review')).toBe(true);
        });

        it('should return false for regular comments', () => {
            expect(hasFossyMarker('This is a regular comment')).toBe(false);
            expect(hasFossyMarker('Please fix this bug')).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(hasFossyMarker(null)).toBe(false);
            expect(hasFossyMarker(undefined)).toBe(false);
        });
    });

    describe('isForceReviewCommand', () => {
        it('should return true for "@fossy review --force"', () => {
            expect(isForceReviewCommand('@fossy review --force')).toBe(true);
        });

        it('should return true for "@fossy start-review --force"', () => {
            expect(isForceReviewCommand('@fossy start-review --force')).toBe(
                true,
            );
        });

        it('should accept single-dash and trailing text', () => {
            expect(isForceReviewCommand('@fossy review -force')).toBe(true);
            expect(
                isForceReviewCommand('@fossy review --force please retry'),
            ).toBe(true);
        });

        it('should be case-insensitive', () => {
            expect(isForceReviewCommand('@FOSSY REVIEW --FORCE')).toBe(true);
        });

        it('should return false for plain review commands', () => {
            expect(isForceReviewCommand('@fossy review')).toBe(false);
            expect(isForceReviewCommand('@fossy start-review')).toBe(false);
        });

        it('should not match "force" embedded mid-word', () => {
            expect(isForceReviewCommand('@fossy review --forced')).toBe(false);
        });

        it('should return false for null/undefined/empty', () => {
            expect(isForceReviewCommand(null)).toBe(false);
            expect(isForceReviewCommand(undefined)).toBe(false);
            expect(isForceReviewCommand('')).toBe(false);
        });

        it('isReviewCommand should still match when --force is present', () => {
            // Force is a *flag on top of* a review command; both helpers
            // must agree so the handler still routes it as a review.
            expect(isReviewCommand('@fossy review --force')).toBe(true);
            expect(isReviewCommand('@fossy start-review --force')).toBe(true);
        });
    });

    describe('isHeavyReviewCommand', () => {
        it('matches --heavy in any position', () => {
            expect(isHeavyReviewCommand('@fossy review --heavy')).toBe(true);
            expect(isHeavyReviewCommand('@fossy review auth --heavy')).toBe(true);
            expect(
                isHeavyReviewCommand('@fossy review --heavy --force'),
            ).toBe(true);
        });

        it('does NOT match a bare `heavy` (dash required, like --force)', () => {
            expect(isHeavyReviewCommand('@fossy review heavy')).toBe(false);
            expect(
                isHeavyReviewCommand('@fossy review heavy checkout path'),
            ).toBe(false);
        });
    });

    describe('parseReviewDirective', () => {
        it('returns the focus text for a plain directive', () => {
            expect(parseReviewDirective('@fossy review auth logic')).toBe(
                'auth logic',
            );
        });

        it('returns undefined when there is no directive', () => {
            expect(parseReviewDirective('@fossy review')).toBeUndefined();
            expect(parseReviewDirective('@fossy review --force')).toBeUndefined();
            expect(parseReviewDirective('@fossy review --heavy')).toBeUndefined();
        });

        it('strips flags whatever their position (leading, trailing, multiple)', () => {
            expect(parseReviewDirective('@fossy review --heavy auth')).toBe(
                'auth',
            );
            expect(parseReviewDirective('@fossy review auth --heavy')).toBe(
                'auth',
            );
            expect(
                parseReviewDirective('@fossy review auth --heavy --force'),
            ).toBe('auth');
            expect(
                parseReviewDirective('@fossy review --force auth --heavy'),
            ).toBe('auth');
        });

        it('does not strip focus words that merely contain heavy/force', () => {
            expect(
                parseReviewDirective('@fossy review the forced retries path'),
            ).toBe('the forced retries path');
        });
    });

    describe('integration: command detection consistency', () => {
        it('should correctly identify review commands vs mentions', () => {
            const reviewCommands = [
                '@fossy review',
                '@fossy start-review',
                '  @fossy review',
                '@FOSSY REVIEW',
            ];

            const nonReviewMentions = [
                '@fossy help',
                '@fossy explain',
                '@fossy what is this code doing?',
                '@fossy',
            ];

            reviewCommands.forEach((cmd) => {
                expect(isReviewCommand(cmd)).toBe(true);
                expect(isFossyMentionNonReview(cmd)).toBe(false);
            });

            nonReviewMentions.forEach((mention) => {
                expect(isReviewCommand(mention)).toBe(false);
                expect(isFossyMentionNonReview(mention)).toBe(true);
            });
        });

        it('should handle edge cases consistently', () => {
            // "reviewing" should not match as review command
            expect(isReviewCommand('@fossy reviewing')).toBe(false);
            expect(isFossyMentionNonReview('@fossy reviewing')).toBe(true);

            // "review-something" should not match as review command
            expect(isReviewCommand('@fossy review-code')).toBe(false);
            expect(isFossyMentionNonReview('@fossy review-code')).toBe(true);
        });
    });
});
