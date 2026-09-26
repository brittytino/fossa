import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';

export class GetOrganizationIdUseCase implements IUseCase {
    constructor(
        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}
    public async execute(): Promise<string> {
        return this.request.user.organization.uuid;
    }
}
