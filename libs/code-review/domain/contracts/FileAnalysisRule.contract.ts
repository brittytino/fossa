/**
 * @license
 * Fossa Tech. All rights reserved.
 */
import { FileChange } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import { AnalysisContext } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import { CodeSuggestion } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import { IClusterizedSuggestion } from '@libs/fossyFineTuning/domain/interfaces/fossyFineTuning.interface';

export interface IFileAnalysisRule {
    /**
     * Verifica se a regra está habilitada para o contexto atual
     */
    isEnabled(context: AnalysisContext): boolean;

    /**
     * Executa a análise de arquivos de acordo com a regra
     */
    analyzeFiles(
        files: FileChange[],
        context: AnalysisContext,
        suggestions: CodeSuggestion[],
        clusterizedSuggestions: IClusterizedSuggestion[],
    ): Promise<{
        validSuggestions: CodeSuggestion[];
        discardedSuggestions: CodeSuggestion[];
    }>;
}
