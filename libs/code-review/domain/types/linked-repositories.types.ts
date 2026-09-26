export interface LinkedRepositoriesReviewMetadata {
    configured: number;
    resolved: number;
    cloned: number;
    failed: number;
    warnings: string[];
    gate?: any;
    repositories: any[];
}

export interface LinkedRepoAccess {
    getMetadata(): LinkedRepositoriesReviewMetadata;
    [key: string]: any;
}

export interface CrossRepoGateMetadata {
    activate: boolean;
    reasons: string[];
    signalKinds: string[];
    signalCount: number;
}

export function formatLinkedReposSummaryLine(_metadata: any): string | null {
    return null;
}
