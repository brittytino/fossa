import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN } from '@libs/code-review/domain/contracts/FossyIssuesManagement.contract';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { IssueStatus } from '@libs/core/infrastructure/config/types/general/issues.type';
import { LabelType } from '@libs/common/utils/codeManagement/labels';
import { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import { ISSUES_SERVICE_TOKEN } from '@libs/issues/domain/contracts/issues.service.contract';
import { IssuesEntity } from '@libs/issues/domain/entities/issues.entity';
import { FossyIssuesManagementService } from '@libs/issues/infrastructure/adapters/service/fossyIssuesManagement.service';
import { IssuesService } from '@libs/issues/infrastructure/adapters/service/issues.service';

@Injectable()
export class UpdateIssuePropertyUseCase implements IUseCase {
    constructor(
        @Inject(ISSUES_SERVICE_TOKEN)
        private readonly issuesService: IssuesService,

        @Inject(FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN)
        private readonly fossyIssuesManagementService: FossyIssuesManagementService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: {
                uuid: string;
                organization: { uuid: string };
            };
        },

        private readonly authorizationService: AuthorizationService,
    ) {}

    async execute(
        uuid: string,
        field: 'severity' | 'label' | 'status',
        value: string,
    ): Promise<IssuesEntity | null> {
        const issue = await this.issuesService.findById(uuid);

        if (!issue || !issue.repository?.id) {
            throw new Error('Issue not found');
        }

        await this.authorizationService.ensure({
            user: this.request.user,
            action: Action.Update,
            resource: ResourceType.Issues,
            repoIds: [issue.repository.id],
        });

        await this.fossyIssuesManagementService.clearIssuesCache(
            issue.organizationId,
        );

        switch (field) {
            case 'severity':
                return await this.issuesService.updateSeverity(
                    uuid,
                    value as SeverityLevel,
                );
            case 'label':
                return await this.issuesService.updateLabel(
                    uuid,
                    value as LabelType,
                );
            case 'status':
                return await this.issuesService.updateStatus(
                    uuid,
                    value as IssueStatus,
                );
            default:
                throw new Error(`Invalid field: ${field}`);
        }
    }
}
