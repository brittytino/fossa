import { Global, Module } from '@nestjs/common';
import { BetterStackClient } from './betterstack.client';
import { IncidentManagerService } from './incident-manager.service';

@Global()
@Module({
    providers: [BetterStackClient, IncidentManagerService],
    exports: [IncidentManagerService],
})
export class IncidentModule {}
