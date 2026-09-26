// Fossy marks everything it posts with `<!-- fossy-codereview -->`. Its
// conversation answers carry `<!-- fossy-conversation -->` as well (#1946), so
// a poll looking for an answer can skip review output (findings, status
// comments) without also skipping the answer.
export function isFossyReviewOutput(body: string): boolean {
    return (
        body.includes('<!-- fossy-codereview') &&
        !body.includes('<!-- fossy-conversation')
    );
}

export function isFossyConversationAnswer(body: string): boolean {
    return body.includes('<!-- fossy-conversation');
}

// A review finding, not the status/summary comment Fossy also marks.
export function isFossyFinding(body: string): boolean {
    return (
        isFossyReviewOutput(body) && !body.includes('fossy-codereview-completed')
    );
}
