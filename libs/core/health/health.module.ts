import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './database.health';
import { ApplicationHealthIndicator } from './application.health';

@Module({
    imports: [TerminusModule, ConfigModule],
    controllers: [HealthController],
    providers: [DatabaseHealthIndicator, ApplicationHealthIndicator],
    exports: [DatabaseHealthIndicator, ApplicationHealthIndicator],
})
export class HealthModule {}
