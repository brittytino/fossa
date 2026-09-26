import { StageVisibility } from '../enums/stage-visibility.enum';
import { PipelineContext } from './pipeline-context.interface';

export interface PipelineObserverContext {
    checkRunId?: string | number | null;
}

export interface IPipelineObserver {
    onStageStart(
        stageName: string,
        context: PipelineContext,
        observerContext: PipelineObserverContext,
        options?: { visibility?: StageVisibility; label?: string },
    ): Promise<void>;
    onStageFinish(
        stageName: string,
        context: PipelineContext,
        observerContext: PipelineObserverContext,
        options?: { visibility?: StageVisibility; label?: string },
    ): Promise<void>;
    onStageError(
        stageName: string,
        error: Error,
        context: PipelineContext,
        observerContext: PipelineObserverContext,
        options?: { visibility?: StageVisibility; label?: string },
    ): Promise<void>;
    onStageSkipped(
        stageName: string,
        reason: string,
        context: PipelineContext,
        observerContext: PipelineObserverContext,
        options?: { visibility?: StageVisibility; label?: string },
    ): Promise<void>;

    onPipelineStart(
        context: PipelineContext,
        observerContext: PipelineObserverContext,
    ): Promise<void>;
    onPipelineFinish(
        context: PipelineContext,
        observerContext: PipelineObserverContext,
    ): Promise<void>;
}
