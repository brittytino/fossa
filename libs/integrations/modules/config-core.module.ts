import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntegrationConfigModel } from '../infrastructure/adapters/repositories/schemas/integrationConfig.model';
import { INTEGRATION_CONFIG_SERVICE_TOKEN } from '../domain/integrationConfigs/contracts/integration-config.service.contracts';
import { IntegrationConfigService } from '../infrastructure/adapters/services/integrationConfig.service';
import { INTEGRATION_CONFIG_REPOSITORY_TOKEN } from '../domain/integrationConfigs/contracts/integration-config.repository.contracts';
import { IntegrationConfigRepository } from '../infrastructure/adapters/repositories/integrationConfig.repository';

@Module({
    imports: [TypeOrmModule.forFeature([IntegrationConfigModel])],
    providers: [
        {
            provide: INTEGRATION_CONFIG_SERVICE_TOKEN,
            useClass: IntegrationConfigService,
        },
        {
            provide: INTEGRATION_CONFIG_REPOSITORY_TOKEN,
            useClass: IntegrationConfigRepository,
        },
    ],
    exports: [
        INTEGRATION_CONFIG_SERVICE_TOKEN,
        INTEGRATION_CONFIG_REPOSITORY_TOKEN,
    ],
})
export class IntegrationConfigCoreModule {}
