import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UseCases } from './application/use-cases';
import { IssuesRepository } from './infrastructure/adapters/repositories/issues.repository';
import { ISSUES_REPOSITORY_TOKEN } from './domain/contracts/issues.repository';
import { ISSUES_SERVICE_TOKEN } from './domain/contracts/issues.service.contract';
import { FossyIssuesManagementService } from './infrastructure/adapters/service/fossyIssuesManagement.service';
import {
    FOSSY_ISSUES_ANALYSIS_SERVICE_TOKEN,
    FossyIssuesAnalysisService,
} from './infrastructure/adapters/service/fossyIssuesAnalysis.service';
import { FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN } from '@libs/code-review/domain/contracts/FossyIssuesManagement.contract';
import {
    IssuesModel,
    IssuesSchema,
} from './infrastructure/adapters/repositories/schemas/issues.model';
import { PullRequestsModule } from '@libs/code-review/modules/pull-requests.module';
import { IntegrationConfigModule } from '@libs/integrations/modules/config.module';
import { ParametersModule } from '@libs/organization/modules/parameters.module';
import { CodeReviewFeedbackModule } from '@libs/code-review/modules/codeReviewFeedback.module';
import { CodebaseModule } from '@libs/code-review/modules/codebase.module';
import { OrganizationModule } from '@libs/organization/modules/organization.module';
import { GlobalCacheModule } from '@libs/core/cache/cache.module';
import { PermissionValidationModule } from '@libs/shared/infrastructure/permissions';
import { IssuesService } from './infrastructure/adapters/service/issues.service';
import { UserModule } from '@libs/identity/modules/user.module';
import { PermissionsModule } from '@libs/identity/modules/permissions.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: IssuesModel.name,
                schema: IssuesSchema,
            },
        ]),
        forwardRef(() => PullRequestsModule),
        forwardRef(() => IntegrationConfigModule),
        forwardRef(() => ParametersModule),
        forwardRef(() => CodeReviewFeedbackModule),
        forwardRef(() => CodebaseModule),
        forwardRef(() => UserModule),
        forwardRef(() => OrganizationModule),
        GlobalCacheModule,
        forwardRef(() => PermissionValidationModule),
        PermissionsModule,
    ],
    providers: [
        ...UseCases,

        {
            provide: ISSUES_REPOSITORY_TOKEN,
            useClass: IssuesRepository,
        },
        {
            provide: ISSUES_SERVICE_TOKEN,
            useClass: IssuesService,
        },
        {
            provide: FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN,
            useClass: FossyIssuesManagementService,
        },
        {
            provide: FOSSY_ISSUES_ANALYSIS_SERVICE_TOKEN,
            useClass: FossyIssuesAnalysisService,
        },
    ],
    exports: [
        ISSUES_REPOSITORY_TOKEN,
        ISSUES_SERVICE_TOKEN,
        FOSSY_ISSUES_MANAGEMENT_SERVICE_TOKEN,
        FOSSY_ISSUES_ANALYSIS_SERVICE_TOKEN,
        ...UseCases,
    ],
})
export class IssuesCoreModule {}
