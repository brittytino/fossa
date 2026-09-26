import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';
import {
    ITeamService,
    TEAM_SERVICE_TOKEN,
} from '@libs/organization/domain/team/contracts/team.service.contract';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ListTeamsUseCase implements IUseCase {
    constructor(
        @Inject(TEAM_SERVICE_TOKEN)
        private readonly teamService: ITeamService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: {
                uuid: string;
                organization: { uuid: string };
                role: string;
            };
        },
    ) {}

    public async execute() {
        const { user } = this.request;
        const userId = user.uuid;
        const role = user.role;
        const organizationId = user.organization.uuid;
        const status = [STATUS.ACTIVE, STATUS.PENDING];
        const options = {
            order: {
                createdAt: 'ASC',
            },
        };

        if (role === Role.OWNER) {
            const teams = await this.teamService.find(
                {
                    organization: { uuid: organizationId },
                },
                status,
                options,
            );

            return teams.map((team) => team.toJson());
        }

        const teams = await this.teamService.getTeamsByUserId(
            userId,
            organizationId,
            status,
            options,
        );

        return teams.map((team) => team.toJson());
    }
}
