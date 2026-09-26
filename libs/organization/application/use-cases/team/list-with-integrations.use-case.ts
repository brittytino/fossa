import { IntegrationCategory } from '@libs/core/domain/enums';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import {
    ITeamService,
    TEAM_SERVICE_TOKEN,
} from '@libs/organization/domain/team/contracts/team.service.contract';
import {
    IntegrationStatusFilter,
    ITeamWithIntegrations,
} from '@libs/organization/domain/team/interfaces/team.interface';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ListTeamsWithIntegrationsUseCase implements IUseCase {
    constructor(
        @Inject(TEAM_SERVICE_TOKEN)
        private readonly teamService: ITeamService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}

    public async execute(): Promise<ITeamWithIntegrations[]> {
        return await this.teamService.findTeamsWithIntegrations({
            organizationId: this.request.user.organization.uuid,
            status: STATUS.ACTIVE,
            integrationStatus: IntegrationStatusFilter.INTEGRATED,
            integrationCategories: [
                IntegrationCategory.CODE_MANAGEMENT,
                IntegrationCategory.PROJECT_MANAGEMENT,
                IntegrationCategory.COMMUNICATION,
            ],
        });
    }
}
