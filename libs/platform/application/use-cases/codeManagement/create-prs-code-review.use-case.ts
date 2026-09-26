import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { AutomationStatus } from '@libs/automation/domain/automation/enum/automation-status';
import {
    AUTOMATION_EXECUTION_SERVICE_TOKEN,
    IAutomationExecutionService,
} from '@libs/automation/domain/automationExecution/contracts/automation-execution.service';
import {
    ITeamAutomationService,
    TEAM_AUTOMATION_SERVICE_TOKEN,
} from '@libs/automation/domain/teamAutomation/contracts/team-automation.service';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { CodeManagementService } from '@libs/platform/infrastructure/adapters/services/codeManagement.service';
import { AutomationType } from '@libs/automation/domain/automation/enum/automation-type';

@Injectable()
export class CreatePRCodeReviewUseCase implements IUseCase {
    constructor(
        private readonly codeManagementService: CodeManagementService,

        @Inject(TEAM_AUTOMATION_SERVICE_TOKEN)
        private readonly teamAutomationService: ITeamAutomationService,

        @Inject(AUTOMATION_EXECUTION_SERVICE_TOKEN)
        private readonly automationExecutionService: IAutomationExecutionService,

        @Inject(REQUEST)
        private readonly request: Request & { user },
    ) {}

    public async execute(params: { teamId: string; payload: any }) {
        const { teamId, payload } = params;
        const organizationId = this.request.user.organization.uuid;

        const organizationAndTeamData: OrganizationAndTeamData = {
            organizationId,
            teamId,
        };

        const data = {
            organizationAndTeamData,
            repository: {
                id: payload.id,
                name: payload.repository,
            },
            prNumber: payload?.pull_number,
            body: '@fossy start-review',
        };

        const response =
            await this.codeManagementService.createSingleIssueComment(data);

        const teamAutomation = await this.teamAutomationService.find({
            team: { uuid: teamId },
        });

        const codeReviewAutomation = teamAutomation.find((automation) => {
            return (automation.automation.automationType =
                AutomationType.AUTOMATION_CODE_REVIEW);
        });

        if (!response) {
            await this.registerFailedAutomationExecution(
                codeReviewAutomation?.uuid,
            );

            throw new HttpException(
                `Error when commenting on PR ${payload.pull_number}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        await this.registerSuccessfulAutomationExecution(
            codeReviewAutomation?.uuid,
            payload,
        );

        return { success: true };
    }

    private async registerFailedAutomationExecution(
        codeReviewAutomationId: string,
    ) {
        const startedCodeReview = {
            status: AutomationStatus.ERROR,
            dataExecution: {},
            teamAutomation: { uuid: codeReviewAutomationId },
            origin: '',
            pullRequestNumber: null,
            repositoryId: null,
        };

        await this.automationExecutionService.create(startedCodeReview);
    }

    private async registerSuccessfulAutomationExecution(
        codeReviewAutomationId: string,
        payload: any,
    ) {
        const startedCodeReview = {
            status: AutomationStatus.SUCCESS,
            dataExecution: {
                onboardingFinishReview: false,
                ...payload,
            },
            teamAutomation: { uuid: codeReviewAutomationId },
            origin: '',
            pullRequestNumber: payload?.pull_number,
            repositoryId: payload?.id,
        };

        await this.automationExecutionService.create(startedCodeReview);
    }
}
