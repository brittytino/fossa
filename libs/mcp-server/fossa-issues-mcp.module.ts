import { DynamicModule, Module, Provider, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PlatformCoreModule } from '@libs/platform/modules/platform-core.module';

import { FossaIssuesMcpController } from './controllers/fossa-issues-mcp.controller';
import { McpEnabledGuard } from './guards/mcp-enabled.guard';
import { McpCoreModule } from './mcp-core.module';
import { FossaIssuesMcpServerFactory } from './services/fossa-issues-mcp-server.factory';
import { FossaIssuesMcpServerService } from './services/fossa-issues-mcp-server.service';
import { FossaIssuesTools } from './tools/fossaIssues.tools';

@Module({})
export class FossaIssuesMcpModule {
    static forRoot(configService?: ConfigService): DynamicModule {
        const imports: any[] = [McpCoreModule];
        const providers: Provider[] = [];
        const controllers = [];
        const exports: Provider[] = [McpCoreModule];

        imports.push(forwardRef(() => PlatformCoreModule));

        controllers.push(FossaIssuesMcpController);

        providers.push(
            FossaIssuesMcpServerFactory,
            FossaIssuesMcpServerService,
            McpEnabledGuard,
            FossaIssuesTools,
        );

        exports.push(FossaIssuesMcpServerService);

        return {
            module: FossaIssuesMcpModule,
            imports,
            controllers,
            providers,
            exports,
            global: true,
        };
    }
}
