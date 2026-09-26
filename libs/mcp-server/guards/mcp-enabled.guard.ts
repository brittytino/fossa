import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpEnabledGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const mcpEnabled = this.configService.get<boolean>(
            'API_MCP_SERVER_ENABLED',
            false,
        );

        if (!mcpEnabled) {
            throw new ForbiddenException('MCP Service is disabled');
        }

        return true;
    }
}
