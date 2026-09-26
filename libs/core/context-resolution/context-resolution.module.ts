import { Module, forwardRef, Global } from '@nestjs/common';
import { ParametersModule } from '@libs/organization/modules/parameters.module';
import { IntegrationCoreModule } from '@libs/integrations/modules/integrations-core.module';
import { IntegrationConfigCoreModule } from '@libs/integrations/modules/config-core.module';
import { ContextResolutionService } from './infrastructure/adapters/services/context-resolution.service';
import { CONTEXT_RESOLUTION_SERVICE_TOKEN } from './domain/contracts/context-resolution.service.contract';

@Global()
@Module({
    imports: [
        forwardRef(() => ParametersModule),
        forwardRef(() => IntegrationCoreModule),
        forwardRef(() => IntegrationConfigCoreModule),
    ],
    providers: [
        {
            provide: CONTEXT_RESOLUTION_SERVICE_TOKEN,
            useClass: ContextResolutionService,
        },
    ],
    exports: [CONTEXT_RESOLUTION_SERVICE_TOKEN],
})
export class ContextResolutionModule {}
