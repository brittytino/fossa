import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { CodeManagementService } from '../../../infrastructure/adapters/services/codeManagement.service';

@Injectable()
export class GetConnectionsUseCase implements IUseCase {
    constructor(
        private readonly codeManagementService: CodeManagementService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}
    public async execute(teamId: any): Promise<any[]> {
        try {
            const params = {
                organizationAndTeamData: {
                    organizationId: this.request.user.organization.uuid,
                    teamId: teamId,
                },
            };

            const [codeManagementConnection] = await Promise.all([
                this.codeManagementService.verifyConnection(params),
            ]);

            return [codeManagementConnection]?.filter(
                (connection) => connection,
            );
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
