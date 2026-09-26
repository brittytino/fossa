import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult, MemoryHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class ApplicationHealthIndicator {
    constructor(
        private readonly configService: ConfigService,
        private readonly memoryHealthIndicator: MemoryHealthIndicator,
    ) {}

    async isApplicationHealthy(): Promise<HealthIndicatorResult> {
        const env = process.env.API_NODE_ENV;
        const uptime = Math.floor(process.uptime());

        // Check if memory heap has exceeded 6GB (adjust for container with 8GB limit)
        // Leaves a 2GB safety margin before the theoretical limit
        const memoryCheck = await this.memoryHealthIndicator.checkHeap(
            'memory_heap',
            6 * 1024 * 1024 * 1024,
        );

        const isMemoryHealthy = memoryCheck.memory_heap.status === 'up';
        const hasValidEnv = !!env;

        // Removed arbitrary uptime > 5s check which caused false down during boot
        const allChecksPass = hasValidEnv && isMemoryHealthy;
        const uptimeFormatted = this.formatUptime(uptime);

        return {
            application: {
                status: allChecksPass ? 'up' : 'down',
                uptime: uptimeFormatted,
                timestamp: new Date().toISOString(),
                environment: env,
                memory: memoryCheck.memory_heap,
            },
        };
    }

    private formatUptime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}
