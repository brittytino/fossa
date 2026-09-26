import { OrganizationParametersKey } from '@libs/core/domain/enums';
import { IOrganization } from '../../organization/interfaces/organization.interface';

export interface IOrganizationParameters {
    uuid: string;
    configKey: OrganizationParametersKey;
    configValue: any;
    organization?: Partial<IOrganization>;
}
