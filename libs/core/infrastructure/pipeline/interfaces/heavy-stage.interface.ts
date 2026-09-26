import { PipelineContext } from './pipeline-context.interface';
import { PipelineStage } from './pipeline.interface';

export interface HeavyStage<
    TContext extends PipelineContext = PipelineContext,
> extends PipelineStage<TContext> {
    resume(context: TContext, taskId: string): Promise<TContext>;
}
