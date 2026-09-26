import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { AuthIntegrationModule } from '@libs/integrations/modules/authIntegration.module';
import { IntegrationConfigCoreModule } from '@libs/integrations/modules/config-core.module';
import { IntegrationCoreModule } from '@libs/integrations/modules/integrations-core.module';
import { CodeManagementService } from '../infrastructure/adapters/services/codeManagement.service';
import { PlatformIntegrationFactory } from '../infrastructure/adapters/services/platformIntegration.factory';
import { AzureReposModule } from './azure-repos.module';
import { BitbucketModule } from './bitbucket.module';
import { ForgejoModule } from './forgejo.module';
import { GithubModule } from './github.module';
import { GitlabModule } from './gitlab.module';
import { ICodeManagementService } from '../domain/platformIntegrations/interfaces/code-management.interface';

@Module({
    imports: [
        forwardRef(() => IntegrationCoreModule),
        forwardRef(() => IntegrationConfigCoreModule),
        forwardRef(() => AuthIntegrationModule),
        forwardRef(() => GithubModule),
        forwardRef(() => GitlabModule),
        forwardRef(() => BitbucketModule),
        forwardRef(() => AzureReposModule),
        forwardRef(() => ForgejoModule),
    ],
    providers: [PlatformIntegrationFactory, CodeManagementService],
    exports: [PlatformIntegrationFactory, CodeManagementService],
})
export class PlatformCoreModule implements OnModuleInit {
    constructor(
        private readonly modulesContainer: ModulesContainer,
        private readonly reflector: Reflector,
        private readonly factory: PlatformIntegrationFactory,
    ) {}

    public onModuleInit() {
        const modules = [...this.modulesContainer.values()];
        modules.forEach(({ providers }) => {
            providers.forEach((wrapper) => {
                const { instance, metatype } = wrapper;

                if (!instance || !metatype) {
                    return;
                }

                const integrationMeta = this.reflector.get<{
                    type: string;
                    serviceType: 'codeManagement';
                }>('integration', metatype);

                if (integrationMeta) {
                    const { type, serviceType } = integrationMeta;

                    if (serviceType === 'codeManagement') {
                        this.factory.registerCodeManagementService(
                            type,
                            instance as ICodeManagementService,
                        );
                    }
                }
            });
        });
    }
}
