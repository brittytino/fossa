import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    IOrganizationService,
    ORGANIZATION_SERVICE_TOKEN,
} from '@libs/organization/domain/organization/contracts/organization.service.contract';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export class GetOrganizationNameUseCase implements IUseCase {
    constructor(
        @Inject(ORGANIZATION_SERVICE_TOKEN)
        private readonly organizationService: IOrganizationService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}

    public async execute(): Promise<string> {
        const org = await this.organizationService.findOne({
            uuid: this.request.user.organization.uuid,
        });

        return org?.name;
    }
}
