import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
    ITeamMemberService,
    TEAM_MEMBERS_SERVICE_TOKEN,
} from '@libs/organization/domain/teamMembers/contracts/teamMembers.service.contracts';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';

export class GetTeamMembersUseCase implements IUseCase {
    constructor(
        @Inject(TEAM_MEMBERS_SERVICE_TOKEN)
        private readonly teamMembersService: ITeamMemberService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}

    public async execute(teamId: any): Promise<any> {
        const members = await this.teamMembersService.findTeamMembersFormated(
            {
                organizationId: this.request.user?.organization?.uuid,
                teamId,
            },
            true,
        );

        const sortedMembers = members.members.sort((a, b) => {
            if (a.email && !b.email) return -1;
            if (!a.email && b.email) return 1;
            return a.email.localeCompare(b.email);
        });

        return { members: sortedMembers };
    }
}
