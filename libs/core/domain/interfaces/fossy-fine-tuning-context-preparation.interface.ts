/**
 * @license
 * Fossa Tech. All rights reserved.
 */

import { IClusterizedSuggestion } from '@libs/fossyFineTuning/domain/interfaces/fossyFineTuning.interface';
import { CodeSuggestion } from '@libs/core/infrastructure/config/types/general/codeReview.type';

export const FOSSY_FINE_TUNING_CONTEXT_PREPARATION_TOKEN = Symbol(
    'FossyFineTuningContextPreparation',
);

export interface IFossyFineTuningContextPreparationService {
    /**
     * Performs fine tuning analysis on code suggestions
     * @param organizationId Organization identifier
     * @param prNumber Pull Request number
     * @param repository Repository information
     * @param suggestionsToAnalyze Suggestions to be analyzed
     * @param isFineTuningEnabled Whether fine tuning is enabled
     * @param clusterizedSuggestions Clusterized suggestions
     * @returns Array of analyzed suggestions
     */
    prepareFossyFineTuningContext(
        organizationId: string,
        prNumber: number,
        repository: {
            id: string;
            full_name: string;
        },
        suggestionsToAnalyze: CodeSuggestion[],
        isFineTuningEnabled: boolean,
        clusterizedSuggestions: IClusterizedSuggestion[],
    ): Promise<{
        keepedSuggestions: Partial<CodeSuggestion>[];
        discardedSuggestions: Partial<CodeSuggestion>[];
    }>;
}
