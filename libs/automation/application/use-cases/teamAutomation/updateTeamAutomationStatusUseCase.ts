import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
    ITeamAutomationService,
    TEAM_AUTOMATION_SERVICE_TOKEN,
} from '@libs/automation/domain/teamAutomation/contracts/team-automation.service';

@Injectable()
export class UpdateTeamAutomationStatusUseCase {
    constructor(
        @Inject(TEAM_AUTOMATION_SERVICE_TOKEN)
        private readonly teamAutomationService: ITeamAutomationService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}

    async execute(teamAutomationId: string, status: boolean) {
        const teamAutomation = await this.teamAutomationService.update(
            {
                uuid: teamAutomationId,
            },
            {
                status: status,
            },
        );

        return teamAutomation;
    }
}
