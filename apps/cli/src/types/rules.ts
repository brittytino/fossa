export type FossyRuleSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FossyRuleScope = 'pull request' | 'file';

export interface FossyRule {
    uuid: string;
    repositoryId?: string;
    title: string;
    rule: string;
    severity?: FossyRuleSeverity;
    scope?: FossyRuleScope;
    path?: string;
}

export interface CentralizedPrResponse {
    mode: 'centralized-pr';
    prUrl?: string;
    prNumber?: number;
    reused?: boolean;
    pending?: boolean;
    message?: string;
}

export type FossyRuleMutationResult = FossyRule | CentralizedPrResponse;

export const isCentralizedPrResponse = (
    value: unknown,
): value is CentralizedPrResponse => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return (value as { mode?: string }).mode === 'centralized-pr';
};

export interface CreateFossyRuleRequest {
    title: string;
    rule: string;
    repositoryId?: string;
    severity?: FossyRuleSeverity;
    scope?: FossyRuleScope;
    path?: string;
}

export interface UpdateFossyRuleRequest {
    repositoryId?: string;
    title?: string;
    rule?: string;
    severity?: FossyRuleSeverity;
    scope?: FossyRuleScope;
    path?: string;
}

export interface ViewFossyRulesRequest {
    ruleId?: string;
    repositoryId?: string;
}
