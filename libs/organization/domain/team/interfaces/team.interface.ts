import { IntegrationCategory } from '@libs/core/domain/enums/integration-category.enum';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';

export interface ITeam<TOrganization = any> {
    uuid: string;
    name: string;
    organization?: Partial<TOrganization> | null;
    status: STATUS;
    cliConfig?: any;
}

export interface ITeamWithIntegrations extends ITeam {
    hasCodeManagement: boolean;
    hasProjectManagement: boolean;
    hasCommunication: boolean;
    isCodeManagementConfigured: boolean;
    isProjectManagementConfigured: boolean;
    isCommunicationConfigured: boolean;
}

export enum IntegrationStatusFilter {
    INTEGRATED = 'INTEGRATED',
    CONFIGURED = 'CONFIGURED',
    UNDEFINED = undefined,
}

export interface TeamsFilter {
    organizationId?: string;
    status?: STATUS;
    integrationCategories?: IntegrationCategory[];
    integrationStatus?: IntegrationStatusFilter;
    matchType?: IntegrationMatchType;
}

export enum IntegrationMatchType {
    SOME = 'SOME',
    EVERY = 'EVERY',
}
