import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiHeader,
    ApiOperation,
    ApiProduces,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { createLogger } from '@libs/core/log/logger';
import { Public } from '@libs/identity/infrastructure/adapters/services/auth/public.decorator';
import { McpEnabledGuard } from '../guards/mcp-enabled.guard';
import { FossaIssuesMcpServerService } from '../services/fossa-issues-mcp-server.service';
import {
    handleStatelessMcpPost,
    handleUnsupportedStatelessMcpMethod,
} from './mcp-controller.helper';

@ApiTags('MCP Issues')
@Public()
@Controller('mcp/issues')
@UseGuards(McpEnabledGuard)
export class FossaIssuesMcpController {
    private readonly logger = createLogger(FossaIssuesMcpController.name);

    constructor(
        private readonly mcpServerService: FossaIssuesMcpServerService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Handle Fossa Issues MCP client request',
        description:
            'Handles JSON-RPC MCP client requests over stateless Streamable HTTP. Each POST creates a fresh MCP server and transport for that request only.',
    })
    @ApiHeader({
        name: 'accept',
        required: true,
        description:
            'Clients should advertise `application/json, text/event-stream` per Streamable HTTP negotiation.',
    })
    @ApiProduces('application/json', 'text/event-stream')
    @ApiBody({
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    async handleClientRequest(@Body() body: any, @Res() res: Response) {
        return handleStatelessMcpPost({
            body,
            res,
            handler: this.mcpServerService.handleRequest.bind(
                this.mcpServerService,
            ),
            errorContext: FossaIssuesMcpController.name,
            errorMessage: 'Error handling Fossa Issues MCP request',
            logger: this.logger,
        });
    }

    @Get()
    @ApiOperation({
        summary: 'GET is not supported for this Fossa Issues MCP endpoint',
        description:
            'This deployment runs MCP in stateless POST-only mode. Long-lived SSE streams are not exposed on this endpoint.',
    })
    @ApiProduces('text/event-stream')
    async handleServerNotifications(@Res() res: Response) {
        return handleUnsupportedStatelessMcpMethod(res);
    }

    @Delete()
    @ApiOperation({
        summary: 'DELETE is not supported for this Fossa Issues MCP endpoint',
        description:
            'This deployment does not keep MCP sessions between requests, so there is no session to terminate.',
    })
    async handleSessionTermination(@Res() res: Response) {
        return handleUnsupportedStatelessMcpMethod(res);
    }
}
