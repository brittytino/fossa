import type {
    FossyRuleMutationResult,
    CreateFossyRuleRequest,
    FossyRule,
    UpdateFossyRuleRequest,
    ViewFossyRulesRequest,
} from '../../types/rules.js';
import { requestWithRetry } from './api-core.js';
import type { IRulesApi } from './api.interface.js';

type RequestWithRetry = <T>(
    endpoint: string,
    options?: RequestInit,
) => Promise<T>;

export class RealRulesApi implements IRulesApi {
    constructor(
        private readonly requester: RequestWithRetry = requestWithRetry,
    ) {}

    private buildAuthHeaders(accessToken: string): Record<string, string> {
        return accessToken.startsWith('fossa_')
            ? { 'X-Team-Key': accessToken }
            : { Authorization: `Bearer ${accessToken}` };
    }

    async createRule(
        accessToken: string,
        payload: CreateFossyRuleRequest,
    ): Promise<FossyRuleMutationResult> {
        return this.requester<FossyRuleMutationResult>('/cli/fossy-rules', {
            method: 'POST',
            headers: this.buildAuthHeaders(accessToken),
            body: JSON.stringify(payload),
        });
    }

    async updateRule(
        accessToken: string,
        ruleId: string,
        payload: UpdateFossyRuleRequest,
    ): Promise<FossyRuleMutationResult> {
        return this.requester<FossyRuleMutationResult>(
            `/cli/fossy-rules/${encodeURIComponent(ruleId)}`,
            {
                method: 'PATCH',
                headers: this.buildAuthHeaders(accessToken),
                body: JSON.stringify(payload),
            },
        );
    }

    async viewRules(
        accessToken: string,
        query: ViewFossyRulesRequest = {},
    ): Promise<FossyRule[]> {
        const params = new URLSearchParams();
        if (query.repositoryId) {
            params.set('repositoryId', query.repositoryId);
        }
        if (query.ruleId) {
            params.set('ruleId', query.ruleId);
        }

        const queryString = params.toString();
        const endpoint = `/cli/fossy-rules${queryString ? `?${queryString}` : ''}`;

        return this.requester<FossyRule[]>(endpoint, {
            headers: this.buildAuthHeaders(accessToken),
        });
    }
}
