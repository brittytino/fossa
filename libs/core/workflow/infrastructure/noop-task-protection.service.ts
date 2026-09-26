import { Injectable, Logger } from '@nestjs/common';
import { ITaskProtectionService } from '../domain/contracts/task-protection.service.contract';

@Injectable()
export class NoOpTaskProtectionService implements ITaskProtectionService {
    private readonly logger = new Logger(NoOpTaskProtectionService.name);

    async protectTask(expiresInMinutes: number): Promise<void> {
        // No-op for non-cloud environments
    }

    async unprotectTask(): Promise<void> {
        // No-op for non-cloud environments
    }
}
