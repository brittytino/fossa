import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AUTH_INTEGRATION_REPOSITORY_TOKEN } from '../domain/authIntegrations/contracts/auth-integration.repository.contracts';
import { AUTH_INTEGRATION_SERVICE_TOKEN } from '../domain/authIntegrations/contracts/auth-integration.service.contracts';
import { AuthIntegrationRepository } from '../infrastructure/adapters/repositories/authIntegration.repository';
import { AuthIntegrationModel } from '../infrastructure/adapters/repositories/schemas/authIntegration.model';
import { AuthIntegrationService } from '../infrastructure/adapters/services/authIntegration.service';

@Module({
    imports: [TypeOrmModule.forFeature([AuthIntegrationModel])],
    providers: [
        {
            provide: AUTH_INTEGRATION_SERVICE_TOKEN,
            useClass: AuthIntegrationService,
        },
        {
            provide: AUTH_INTEGRATION_REPOSITORY_TOKEN,
            useClass: AuthIntegrationRepository,
        },
    ],
    exports: [
        AUTH_INTEGRATION_SERVICE_TOKEN,
        AUTH_INTEGRATION_REPOSITORY_TOKEN,
    ],
})
export class AuthIntegrationModule {}
