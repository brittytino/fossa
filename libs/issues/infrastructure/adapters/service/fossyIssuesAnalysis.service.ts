import { createLogger } from '@libs/core/log/logger';
import { LLM } from '@libs/llm/llm';
import { llmErrorLogLevel } from '@libs/llm/error-classifier';
import type { NormalizedModel } from '@libs/llm/byok-config';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { ObservabilityService } from '@libs/core/log/observability.service';
import {
    prompt_fossyissues_merge_suggestions_into_issues_system,
    prompt_fossyissues_resolve_issues_system,
} from '@libs/common/utils/prompts/fossyIssuesManagement';
import { contextToGenerateIssues } from '@libs/issues/domain/interfaces/fossyIssuesManagement.interface';

export const FOSSY_ISSUES_ANALYSIS_SERVICE_TOKEN = Symbol(
    'FossyIssuesAnalysisService',
);

export const fossyIssuesMergeSchema = z.object({
    matches: z.array(
        z.object({
            suggestionId: z.string(),
            existingIssueId: z.string().optional(),
        }),
    ),
});

export const fossyIssuesResolveSchema = z.object({
    issueVerificationResults: z.array(
        z.object({
            issueId: z.string(),
            issueTitle: z.string().optional(),
            contributingSuggestionIds: z.array(z.string()).optional(),
            isIssuePresentInCode: z.boolean(),
            verificationConfidence: z
                .enum(['high', 'medium', 'low'])
                .optional(),
            reasoning: z.string().optional(),
        }),
    ),
});

@Injectable()
export class FossyIssuesAnalysisService {
    private readonly logger = createLogger(FossyIssuesAnalysisService.name);
    public readonly isCloud: boolean = false;
    public readonly isDevelopment: boolean = false;

    constructor(private readonly observabilityService: ObservabilityService) {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    async mergeSuggestionsIntoIssues(
        organizationAndTeamData: OrganizationAndTeamData,
        pullRequest: any,
        promptData: any,
        byokConfig: NormalizedModel | undefined,
    ): Promise<any> {
        try {
            const runName = 'mergeSuggestionsIntoIssues';

            const result = await LLM.run({
                byokConfig: byokConfig ?? undefined,
                schema: fossyIssuesMergeSchema,
                system: prompt_fossyissues_merge_suggestions_into_issues_system(),
                user: JSON.stringify(promptData),
                runName: `${FossyIssuesAnalysisService.name}::${runName}`,
                organizationId: organizationAndTeamData?.organizationId,
                attrs: {
                    prNumber: pullRequest?.number,
                    fallback: false,
                },
            });

            if (!result) {
                const message = `No response from LLM for PR#${pullRequest.number}`;
                this.logger.warn({
                    message,
                    context: FossyIssuesAnalysisService.name,
                    metadata: {
                        organizationAndTeamData,
                        prNumber: pullRequest.number,
                    },
                });
                throw new Error(message);
            }

            return result;
        } catch (error) {
            this.logger[llmErrorLogLevel(error)]({
                message: 'Error in mergeSuggestionsIntoIssues',
                context: FossyIssuesAnalysisService.name,
                error,
                metadata: {
                    organizationAndTeamData,
                    prNumber: pullRequest?.number,
                },
            });
            throw error;
        }
    }

    async resolveExistingIssues(
        context: Pick<
            contextToGenerateIssues,
            'organizationAndTeamData' | 'repository' | 'pullRequest'
        >,
        promptData: any,
        byokConfig: NormalizedModel | undefined,
    ): Promise<any> {
        try {
            const runName = 'resolveExistingIssues';

            const result = await LLM.run({
                byokConfig: byokConfig ?? undefined,
                schema: fossyIssuesResolveSchema,
                system: prompt_fossyissues_resolve_issues_system(),
                user: JSON.stringify(promptData),
                runName: `${FossyIssuesAnalysisService.name}::${runName}`,
                organizationId: context.organizationAndTeamData?.organizationId,
                attrs: {
                    prNumber: context.pullRequest?.number,
                    fallback: false,
                },
            });

            if (!result) {
                const message = `No response from LLM for PR#${context.pullRequest.number}`;
                this.logger.warn({
                    message,
                    context: FossyIssuesAnalysisService.name,
                    metadata: {
                        organizationAndTeamData:
                            context.organizationAndTeamData,
                        prNumber: context.pullRequest.number,
                    },
                });
                throw new Error(message);
            }

            return result;
        } catch (error) {
            this.logger[llmErrorLogLevel(error)]({
                message: 'Error in resolveExistingIssues',
                context: FossyIssuesAnalysisService.name,
                error,
                metadata: {
                    organizationAndTeamData: context.organizationAndTeamData,
                    prNumber: context.pullRequest?.number,
                },
            });
            throw error;
        }
    }
}
