import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

import { IIntegrationRepository } from './integration.repository.contracts';

export const INTEGRATION_SERVICE_TOKEN = Symbol.for('IntegrationService');

export interface IIntegrationService extends IIntegrationRepository {
    getPlatformAuthDetails<T>(
        organizationAndTeamData: OrganizationAndTeamData,
        platform: PlatformType,
    ): Promise<T>;
    getPlatformIntegration(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<{
        codeManagement: string;
    }>;
}
