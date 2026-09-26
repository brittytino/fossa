import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

import { IProfileConfigRepository } from './profileConfig.repository.contract';
import { ProfileConfigEntity } from '../entities/profileConfig.entity';
import { ProfileConfigKey } from '../enum/profileConfigKey.enum';

export const PROFILE_CONFIG_SERVICE_TOKEN = Symbol.for(
    'IntegrationConfigService',
);

export interface IProfileConfigService extends IProfileConfigRepository {
    createOrUpdateConfig(
        profileConfigKey: ProfileConfigKey,
        payload: any,
        organizationAndTeamData: OrganizationAndTeamData,
    );
    findProfileConfigFormatted<T>(
        configKey: ProfileConfigKey,
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<T>;

    findProfileConfigOrganizationOwner(
        organization_id: string,
    ): Promise<ProfileConfigEntity>;
}
