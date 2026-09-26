import { forwardRef, Module } from '@nestjs/common';
import { CodeReviewCoreModule } from './code-review-core.module';

@Module({
    imports: [forwardRef(() => CodeReviewCoreModule)],
    exports: [CodeReviewCoreModule],
})
export class CodeReviewExecutionModule {}
