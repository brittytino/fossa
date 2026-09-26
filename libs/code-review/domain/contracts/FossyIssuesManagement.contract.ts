import type { NormalizedModel } from '@libs/llm/byok-config';

import { CodeSuggestion } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import { contextToGenerateIssues } from '@libs/issues/domain/interfaces/fossyIssuesManagement.interface';

export const FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN = Symbol(
    'FossyIssuesManagementService',
);

export interface IFossyIssuesManagementService {
    processClosedPr(params: contextToGenerateIssues): Promise<void>;

    mergeSuggestionsIntoIssues(
        context: Pick<
            contextToGenerateIssues,
            'organizationAndTeamData' | 'repository' | 'pullRequest'
        >,
        filePath: string,
        newSuggestions: Partial<CodeSuggestion>[],
        byokConfig: NormalizedModel | undefined,
    ): Promise<any>;

    createNewIssues(
        context: Pick<
            contextToGenerateIssues,
            'organizationAndTeamData' | 'repository' | 'pullRequest'
        >,
        unmatchedSuggestions: Partial<CodeSuggestion>[],
    ): Promise<void>;

    resolveExistingIssues(
        context: Pick<
            contextToGenerateIssues,
            'organizationAndTeamData' | 'repository' | 'pullRequest'
        >,
        files: any[],
        byokConfig: NormalizedModel | undefined,
    ): Promise<void>;
}
