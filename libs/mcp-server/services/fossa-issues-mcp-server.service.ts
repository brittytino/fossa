import { createLogger } from '@libs/core/log/logger';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { hostname } from 'node:os';

import { extractMcpRequestMetadata } from '../utils/mcp-protocol.utils';
import { FossaIssuesMcpServerFactory } from './fossa-issues-mcp-server.factory';

@Injectable()
export class FossaIssuesMcpServerService {
    private readonly logger = createLogger(FossaIssuesMcpServerService.name);
    private readonly instanceId = hostname();

    constructor(private readonly factory: FossaIssuesMcpServerFactory) {}

    async handleRequest(body: any, res: Response): Promise<void> {
        const startedAt = Date.now();
        const { server, transport } = await this.factory.create();
        const requestMetadata = extractMcpRequestMetadata(body);
        let isClosed = false;
        let isFinished = false;

        const closeTransport = () => {
            if (isClosed) {
                return;
            }

            isClosed = true;
            void transport.close();
            void server.close();
        };

        this.logger.log({
            message: 'Fossa Issues MCP stateless request received',
            context: FossaIssuesMcpServerService.name,
            metadata: {
                method: res.req.method,
                path: res.req.originalUrl ?? res.req.url,
                instanceId: this.instanceId,
                ...requestMetadata,
            },
        });

        res.once('close', closeTransport);
        res.once('close', () => {
            if (isFinished) {
                return;
            }

            this.logger.warn({
                message: 'Fossa Issues MCP stateless request aborted',
                context: FossaIssuesMcpServerService.name,
                metadata: {
                    method: res.req.method,
                    path: res.req.originalUrl ?? res.req.url,
                    statusCode: res.statusCode,
                    latencyMs: Date.now() - startedAt,
                    instanceId: this.instanceId,
                    ...requestMetadata,
                },
            });
        });
        res.once('finish', () => {
            isFinished = true;
            this.logger.log({
                message: 'Fossa Issues MCP stateless request completed',
                context: FossaIssuesMcpServerService.name,
                metadata: {
                    method: res.req.method,
                    path: res.req.originalUrl ?? res.req.url,
                    statusCode: res.statusCode,
                    latencyMs: Date.now() - startedAt,
                    instanceId: this.instanceId,
                    ...requestMetadata,
                },
            });

            closeTransport();
        });

        try {
            await transport.handleRequest(res.req, res, body);
        } catch (error) {
            this.logger.error({
                message: 'Fossa Issues MCP stateless request failed',
                context: FossaIssuesMcpServerService.name,
                error: error instanceof Error ? error : undefined,
                metadata: {
                    method: res.req.method,
                    path: res.req.originalUrl ?? res.req.url,
                    statusCode: res.statusCode,
                    latencyMs: Date.now() - startedAt,
                    instanceId: this.instanceId,
                    ...requestMetadata,
                },
            });
            closeTransport();
            throw error;
        }
    }

    getAvailableToolsCount(): number {
        return this.factory.getAvailableToolsCount();
    }
}
