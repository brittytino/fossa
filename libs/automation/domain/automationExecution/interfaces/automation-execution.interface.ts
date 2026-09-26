import { CodeReviewExecution } from '@libs/automation/domain/codeReviewExecutions/interfaces/codeReviewExecution.interface';

import { ITeamAutomation } from '@libs/automation/domain/teamAutomation/interfaces/team-automation.interface';
import { AutomationStatus } from '@libs/automation/domain/automation/enum/automation-status';

export interface IAutomationExecution {
    uuid: string;
    createdAt?: Date;
    updatedAt?: Date;
    status: AutomationStatus;
    errorMessage?: string;
    dataExecution?: any;
    pullRequestNumber?: number;
    repositoryId?: string;
    teamAutomation?: Partial<ITeamAutomation>;
    codeReviewExecutions?: Array<
        Partial<CodeReviewExecution<IAutomationExecution>>
    >;
    origin: string;
}
