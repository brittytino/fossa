import { Injectable } from '@nestjs/common';

import { ICodeManagementService } from '@libs/platform/domain/platformIntegrations/interfaces/code-management.interface';

@Injectable()
export class PlatformIntegrationFactory {
    private codeManagementServices = new Map<string, ICodeManagementService>();

    registerCodeManagementService(
        type: string,
        service: ICodeManagementService,
    ) {
        this.codeManagementServices.set(type, service);
    }

    getCodeManagementService(type: string): ICodeManagementService {
        const service = this.codeManagementServices.get(type);

        if (!service) {
            throw new Error(`Repository service for type '${type}' not found.`);
        }
        return service;
    }
}
