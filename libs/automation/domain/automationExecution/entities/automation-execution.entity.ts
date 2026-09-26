import { CodeReviewExecution } from '@libs/automation/domain/codeReviewExecutions/interfaces/codeReviewExecution.interface';

import { AutomationStatus } from '../../automation/enum/automation-status';
import { ITeamAutomation } from '../../teamAutomation/interfaces/team-automation.interface';
import { IAutomationExecution } from '../interfaces/automation-execution.interface';

export class AutomationExecutionEntity implements IAutomationExecution {
    private _uuid: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _status: AutomationStatus;
    private _errorMessage?: string;
    private _dataExecution?: any;
    private _pullRequestNumber?: number;
    private _repositoryId?: string;
    private _teamAutomation?: Partial<ITeamAutomation>;
    private _codeReviewExecutions?: Array<
        Partial<CodeReviewExecution<IAutomationExecution>>
    >;
    private _origin?: string;

    constructor(
        automationExecution:
            | IAutomationExecution
            | Partial<IAutomationExecution>,
    ) {
        this._uuid = automationExecution.uuid;
        this._createdAt = automationExecution.createdAt;
        this._updatedAt = automationExecution.updatedAt;
        this._status = automationExecution.status;
        this._errorMessage = automationExecution.errorMessage;
        this._dataExecution = automationExecution.dataExecution;
        this._pullRequestNumber = automationExecution?.pullRequestNumber;
        this._repositoryId = automationExecution?.repositoryId;
        this._teamAutomation = automationExecution.teamAutomation;
        this._codeReviewExecutions = automationExecution.codeReviewExecutions;
        this._origin = automationExecution.origin;
    }

    public static create(
        automationExecution:
            | IAutomationExecution
            | Partial<IAutomationExecution>,
    ): AutomationExecutionEntity {
        return new AutomationExecutionEntity(automationExecution);
    }

    public toObject(
        automationExecution: AutomationExecutionEntity,
    ): IAutomationExecution {
        return {
            uuid: automationExecution.uuid,
            createdAt: automationExecution.createdAt,
            updatedAt: automationExecution.updatedAt,
            status: automationExecution.status,
            errorMessage: automationExecution.errorMessage,
            dataExecution: automationExecution.dataExecution,
            pullRequestNumber: automationExecution.pullRequestNumber,
            repositoryId: automationExecution.repositoryId,
            teamAutomation: automationExecution.teamAutomation,
            codeReviewExecutions: automationExecution.codeReviewExecutions,
            origin: automationExecution.origin,
        };
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get status(): AutomationStatus {
        return this._status;
    }

    public get errorMessage(): string {
        return this._errorMessage;
    }

    public get dataExecution(): any {
        return this._dataExecution;
    }

    public get pullRequestNumber(): number {
        return this._pullRequestNumber;
    }

    public get repositoryId(): string {
        return this._repositoryId;
    }

    public get teamAutomation(): Partial<ITeamAutomation> {
        return this._teamAutomation;
    }

    public get codeReviewExecutions(): Array<
        Partial<CodeReviewExecution<IAutomationExecution>>
    > {
        return [...this._codeReviewExecutions];
    }

    public get origin(): string {
        return this._origin;
    }
}
