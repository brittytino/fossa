import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN } from '@libs/code-review/domain/contracts/FossyIssuesManagement.contract';
import { GetIssuesByFiltersDto } from '@libs/core/domain/dtos/get-issues-by-filters.dto';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IIssuesService,
    ISSUES_SERVICE_TOKEN,
} from '@libs/issues/domain/contracts/issues.service.contract';
import { FossyIssuesManagementService } from '@libs/issues/infrastructure/adapters/service/fossyIssuesManagement.service';

@Injectable()
export class GetTotalIssuesUseCase implements IUseCase {
    constructor(
        @Inject(ISSUES_SERVICE_TOKEN)
        private readonly issuesService: IIssuesService,

        @Inject(FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN)
        private readonly fossyIssuesManagementService: FossyIssuesManagementService,

        @Inject(REQUEST)
        private readonly request: UserRequest,

        private readonly authorizationService: AuthorizationService,
    ) {}

    async execute(filters: GetIssuesByFiltersDto): Promise<number> {
        const newFilters: Parameters<
            typeof this.fossyIssuesManagementService.buildFilter
        >[0] = { ...filters };

        if (!newFilters?.organizationId) {
            newFilters.organizationId = this.request.user.organization.uuid;
        }

        const assignedRepositoryIds =
            await this.authorizationService.getRepositoryScope({
                user: this.request.user,
                action: Action.Read,
                resource: ResourceType.Issues,
            });

        if (assignedRepositoryIds !== null) {
            newFilters.repositoryIds = assignedRepositoryIds;
        }

        const filter =
            await this.fossyIssuesManagementService.buildFilter(newFilters);
        return this.issuesService.count(filter);
    }
}
