import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    PullRequestsModel,
    PullRequestsSchema,
} from './infrastructure/adapters/repositories/schemas/pullRequests.model';
import { PullRequestsRepository } from './infrastructure/adapters/repositories/pullRequests.repository';
import { PullRequestsService } from './infrastructure/adapters/services/pullRequests.service';
import { PULL_REQUESTS_REPOSITORY_TOKEN } from './domain/pullRequests/contracts/pullRequests.repository';
import { PULL_REQUESTS_SERVICE_TOKEN } from './domain/pullRequests/contracts/pullRequests.service.contracts';
import { SavePullRequestUseCase } from './application/use-cases/pullRequests/save.use-case';
import { BackfillHistoricalPRsUseCase } from './application/use-cases/pullRequests/backfill-historical-prs.use-case';
import { PlatformModule } from '@libs/platform/modules/platform.module';
import { IntegrationConfigModule } from '@libs/integrations/modules/config.module';
import { PermissionsModule } from '@libs/identity/modules/permissions.module';
import { PermissionValidationModule } from '@libs/shared/infrastructure/permissions';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: PullRequestsModel.name,
                schema: PullRequestsSchema,
            },
        ]),
        forwardRef(() => PlatformModule),
        forwardRef(() => IntegrationConfigModule),
        forwardRef(() => PermissionsModule),
        forwardRef(() => PermissionValidationModule),
    ],
    providers: [
        {
            provide: PULL_REQUESTS_REPOSITORY_TOKEN,
            useClass: PullRequestsRepository,
        },
        {
            provide: PULL_REQUESTS_SERVICE_TOKEN,
            useClass: PullRequestsService,
        },
        SavePullRequestUseCase,
        BackfillHistoricalPRsUseCase,
    ],
    exports: [
        PULL_REQUESTS_REPOSITORY_TOKEN,
        PULL_REQUESTS_SERVICE_TOKEN,
        SavePullRequestUseCase,
        BackfillHistoricalPRsUseCase,
    ],
})
export class PlatformDataModule {}
