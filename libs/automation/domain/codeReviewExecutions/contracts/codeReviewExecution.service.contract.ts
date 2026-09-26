import { ICodeReviewExecutionRepository } from './codeReviewExecution.repository.contract';
import { CodeReviewExecutionEntity } from '../entities/codeReviewExecution.entity';
import { CodeReviewExecution } from '../interfaces/codeReviewExecution.interface';
import { AutomationStatus } from '../../automation/enum/automation-status';

export const CODE_REVIEW_EXECUTION_SERVICE = Symbol(
    'CODE_REVIEW_EXECUTION_SERVICE',
);

export interface ICodeReviewExecutionService<
    T,
> extends ICodeReviewExecutionRepository<T> {
    updateById(
        uuid: string,
        data: Partial<
            Omit<CodeReviewExecution<T>, 'uuid' | 'createdAt' | 'updatedAt'>
        >,
    ): Promise<CodeReviewExecutionEntity<T> | null>;

    findLatestInProgress(
        executionId: string,
        stageName: string,
    ): Promise<CodeReviewExecutionEntity<T> | null>;

    existsByAutomationExecutionAndStageStatus(
        executionId: string,
        stageNames: string[],
        statuses: AutomationStatus[],
    ): Promise<boolean>;
}
