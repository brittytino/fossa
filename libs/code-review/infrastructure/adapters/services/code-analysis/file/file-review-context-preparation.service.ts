import { createLogger } from '@libs/core/log/logger';
import type { NormalizedModel } from '@libs/llm/byok-config';
import { Inject, Injectable } from '@nestjs/common';
import { IAIAnalysisService } from '@libs/code-review/domain/contracts/AIAnalysisService.contract';
import { BaseFileReviewContextPreparation } from './base-file-review.abstract';
import { LLM_ANALYSIS_SERVICE_TOKEN } from '../../llmAnalysis.service';
import { ReviewModeOptions } from '@libs/core/domain/interfaces/file-review-context-preparation.interface';
import {
    AnalysisContext,
    FileChange,
    ReviewModeResponse,
} from '@libs/core/infrastructure/config/types/general/codeReview.type';

@Injectable()
export class FileReviewContextPreparation extends BaseFileReviewContextPreparation {
    protected readonly logger = createLogger(FileReviewContextPreparation.name);

    constructor(
        @Inject(LLM_ANALYSIS_SERVICE_TOKEN)
        private readonly aiAnalysisService: IAIAnalysisService,
    ) {
        super();
    }

    protected async determineReviewMode(
        _options?: ReviewModeOptions,
        _byokConfig?: NormalizedModel,
    ): Promise<ReviewModeResponse> {
        return ReviewModeResponse.HEAVY_MODE;
    }

    protected async prepareFileContextInternal(
        file: FileChange,
        patchWithLinesStr: string,
        context: AnalysisContext,
    ): Promise<{ fileContext: AnalysisContext } | null> {
        const baseContext = await super.prepareFileContextInternal(
            file,
            patchWithLinesStr,
            context,
        );

        if (!baseContext) {
            return null;
        }

        const fileContext: AnalysisContext = {
            ...baseContext.fileContext,
            workflowJobId: context.workflowJobId,
        };

        return { fileContext };
    }

    protected async getRelevantFileContent(
        file: FileChange,
        _context: AnalysisContext,
    ): Promise<{
        relevantContent: string | null;
        hasRelevantContent?: boolean;
    }> {
        try {
            if (file.astFormattedContent) {
                return {
                    relevantContent: file.astFormattedContent,
                    hasRelevantContent: true,
                };
            }
            return {
                relevantContent: null,
                hasRelevantContent: false,
            };
        } catch (error) {
            this.logger.error({
                message: 'Error extracting relevant file content',
                error,
            });
            return {
                relevantContent: null,
                hasRelevantContent: false,
            };
        }
    }
}
