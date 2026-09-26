import { CodeReviewExecutionEntity } from '../entities/codeReviewExecution.entity';
import { CodeReviewExecution } from '../interfaces/codeReviewExecution.interface';
import { AutomationStatus } from '../../automation/enum/automation-status';

export const CODE_REVIEW_EXECUTION_REPOSITORY = Symbol(
    'CODE_REVIEW_EXECUTION_REPOSITORY',
);

export interface ICodeReviewExecutionRepository<T> {
    create(
        codeReviewExecution: Omit<
            CodeReviewExecution<T>,
            'uuid' | 'createdAt' | 'updatedAt'
        >,
    ): Promise<CodeReviewExecutionEntity<T> | null>;

    update(
        filter: Partial<CodeReviewExecution<T>>,
        codeReviewExecution: Partial<
            Omit<CodeReviewExecution<T>, 'uuid' | 'createdAt' | 'updatedAt'>
        >,
    ): Promise<CodeReviewExecutionEntity<T> | null>;

    find(
        filter?: Partial<CodeReviewExecution<T>>,
    ): Promise<CodeReviewExecutionEntity<T>[]>;

    findOne(
        filter?: Partial<CodeReviewExecution<T>>,
    ): Promise<CodeReviewExecutionEntity<T> | null>;

    findManyByAutomationExecutionIds(
        uuids: string[],
        options?: {
            visibility?: string;
        },
    ): Promise<CodeReviewExecutionEntity<T>[]>;

    existsByAutomationExecutionAndStageStatus(
        executionId: string,
        stageNames: string[],
        statuses: AutomationStatus[],
    ): Promise<boolean>;

    delete(uuid: string): Promise<boolean>;
}
