import { forwardRef, Module } from '@nestjs/common';
import { CodebaseModule } from './codebase.module';
import { FILE_REVIEW_CONTEXT_PREPARATION_PROVIDER } from '@libs/core/providers/file-analyzer.provider';
import { FILE_REVIEW_CONTEXT_PREPARATION_TOKEN } from '@libs/core/domain/interfaces/file-review-context-preparation.interface';
import { FileReviewContextPreparation } from '../infrastructure/adapters/services/code-analysis/file/file-review-context-preparation.service';
import { FileReviewContextPreparation as CoreFileReviewContextPreparation } from '../infrastructure/adapters/services/code-analysis/file/noop-file-review.service';

@Module({
    imports: [
        forwardRef(() => CodebaseModule),
    ],
    providers: [
        FileReviewContextPreparation,
        CoreFileReviewContextPreparation,
        FILE_REVIEW_CONTEXT_PREPARATION_PROVIDER,
    ],
    exports: [
        FILE_REVIEW_CONTEXT_PREPARATION_TOKEN,
        FileReviewContextPreparation,
    ],
})
export class FileReviewModule {}
