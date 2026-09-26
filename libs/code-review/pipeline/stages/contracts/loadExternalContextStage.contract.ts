import { BasePipelineStage } from '@libs/core/infrastructure/pipeline/abstracts/base-stage.abstract';
import { CodeReviewPipelineContext } from '../../context/code-review-pipeline.context';

export const LOAD_EXTERNAL_CONTEXT_STAGE_TOKEN =
    'LOAD_EXTERNAL_CONTEXT_STAGE_TOKEN';

export interface ILoadExternalContextStage extends BasePipelineStage<CodeReviewPipelineContext> {
    readonly stageName: string;
}
