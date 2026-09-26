import {
    CodeSuggestion,
    Comment,
} from '@libs/core/infrastructure/config/types/general/codeReview.type';

/**
 * Calculates the start line for a review comment based on suggestion lines.
 * Returns undefined if start equals end or if range is too large (>15 lines).
 */
export function calculateCommentStartLine(
    suggestion: Partial<CodeSuggestion>,
): number | undefined {
    if (
        suggestion.relevantLinesStart === undefined ||
        suggestion.relevantLinesStart === suggestion.relevantLinesEnd
    ) {
        return undefined;
    }
    return suggestion.relevantLinesStart + 15 > suggestion.relevantLinesEnd
        ? suggestion.relevantLinesStart
        : undefined;
}

/**
 * Calculates the end line for a review comment based on suggestion lines.
 * If range is too large (>15 lines), returns start line instead.
 */
export function calculateCommentEndLine(
    suggestion: Partial<CodeSuggestion>,
): number | undefined {
    if (
        suggestion.relevantLinesStart === undefined ||
        suggestion.relevantLinesStart === suggestion.relevantLinesEnd
    ) {
        return suggestion.relevantLinesEnd;
    }
    return suggestion.relevantLinesStart + 15 > suggestion.relevantLinesEnd
        ? suggestion.relevantLinesEnd
        : suggestion.relevantLinesStart;
}

/**
 * Builds a Comment object from a CodeSuggestion for use in review comment creation.
 */
export function buildCommentFromSuggestion(
    suggestion: Partial<CodeSuggestion>,
    repositoryLanguage: string,
): Comment {
    return {
        path: suggestion.relevantFile,
        body: {
            language: repositoryLanguage,
            improvedCode: suggestion.improvedCode,
            suggestionContent: suggestion.suggestionContent,
            actionStatement:
                suggestion.clusteringInformation?.actionStatement || '',
        },
        start_line: calculateCommentStartLine(suggestion),
        line: calculateCommentEndLine(suggestion),
        side: 'RIGHT',
        suggestion: suggestion as CodeSuggestion,
    };
}
