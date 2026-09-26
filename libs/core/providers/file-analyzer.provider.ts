import { Provider } from '@nestjs/common';
import {
    FILE_REVIEW_CONTEXT_PREPARATION_TOKEN,
    IFileReviewContextPreparation,
} from '@libs/core/domain/interfaces/file-review-context-preparation.interface';
import { FileReviewContextPreparation } from '@libs/code-review/infrastructure/adapters/services/code-analysis/file/file-review-context-preparation.service';
import { LLM_ANALYSIS_SERVICE_TOKEN } from '@libs/code-review/infrastructure/adapters/services/llmAnalysis.service';
import { IAIAnalysisService } from '@libs/code-review/domain/contracts/AIAnalysisService.contract';

export const FILE_REVIEW_CONTEXT_PREPARATION_PROVIDER: Provider = {
    provide: FILE_REVIEW_CONTEXT_PREPARATION_TOKEN,
    useFactory: (
        aiAnalysisService: IAIAnalysisService,
    ): IFileReviewContextPreparation => {
        return new FileReviewContextPreparation(aiAnalysisService);
    },
    inject: [LLM_ANALYSIS_SERVICE_TOKEN],
};
