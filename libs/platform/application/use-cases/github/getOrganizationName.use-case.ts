import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    GITHUB_SERVICE_TOKEN,
    IGithubService,
} from '@libs/platform/domain/github/contracts/github.service.contract';

export class GetOrganizationNameUseCase implements IUseCase {
    constructor(
        @Inject(GITHUB_SERVICE_TOKEN)
        private readonly githubService: IGithubService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}

    public async execute() {
        const data = await this.githubService.findOneByOrganizationId({
            organizationId: this.request.user?.organization?.uuid,
        });

        return data?.organizationName ?? '';
    }
}
