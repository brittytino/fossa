import { PullRequestsModule } from '@libs/code-review/modules/pull-requests.module';
import { IssuesModule } from '@libs/issues/issues.module';
import { FossyRulesModule } from '@libs/fossyRules/modules/fossyRules.module';
import { PlatformModule } from '@libs/platform/modules/platform.module';
import { DynamicModule, Module, Provider, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpController } from './controllers/mcp.controller';
import { McpEnabledGuard } from './guards/mcp-enabled.guard';
import { McpCoreModule } from './mcp-core.module';
import { McpServerFactory } from './services/mcp-server.factory';
import { McpServerService } from './services/mcp-server.service';
import { CodeManagementTools, FossyRulesTools } from './tools';
import { FossyIssuesTools } from './tools/fossyIssues.tools';
import { CentralizedConfigModule } from '@libs/centralized-config/modules/centralized-config.module';

@Module({})
export class McpModule {
    static forRoot(configService?: ConfigService): DynamicModule {
        const imports: any[] = [McpCoreModule];
        const providers: Provider[] = [];
        const controllers = [];
        const exports: Provider[] = [McpCoreModule];

        // Always provide MCPManagerService and MCPToolMetadataService via Core Module
        // providers.push(MCPManagerService, MCPToolMetadataService);
        // exports.push(MCPManagerService, MCPToolMetadataService);

        // Always import required modules for MCPManagerService dependencies - MOVED TO CORE
        // imports.push(
        //    JwtModule,
        //    forwardRef(() => PermissionValidationModule),
        //    forwardRef(() => IntegrationModule),
        // );

        const isEnabled =
            process.env.API_MCP_SERVER_ENABLED === 'true' ||
            configService?.get<boolean>('API_MCP_SERVER_ENABLED', false);

        if (isEnabled) {
            imports.push(
                forwardRef(() => PlatformModule),
                forwardRef(() => FossyRulesModule),
                forwardRef(() => IssuesModule),
                forwardRef(() => PullRequestsModule),
                forwardRef(() => CentralizedConfigModule),
            );

            controllers.push(McpController);

            providers.push(
                McpServerFactory,
                McpServerService,
                McpEnabledGuard,
                CodeManagementTools,
                FossyRulesTools,
                FossyIssuesTools,
            );

            exports.push(McpServerService);
        }

        return {
            module: McpModule,
            imports,
            controllers,
            providers,
            exports,
            global: true,
        };
    }
}
