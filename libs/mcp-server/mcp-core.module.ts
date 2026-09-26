import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MCPManagerService } from './services/mcp-manager.service';
import { MCPToolMetadataService } from './services/mcp-tool-metadata.service';
import { PermissionValidationModule } from '@libs/shared/infrastructure/permissions';
import { IntegrationModule } from '@libs/integrations/modules/integrations.module';

@Module({
    imports: [
        JwtModule,
        forwardRef(() => PermissionValidationModule),
        forwardRef(() => IntegrationModule),
    ],
    providers: [MCPManagerService, MCPToolMetadataService],
    exports: [MCPManagerService, MCPToolMetadataService],
})
export class McpCoreModule {}
