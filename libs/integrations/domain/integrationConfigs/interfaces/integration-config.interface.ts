import { IntegrationConfigKey } from '@libs/core/domain/enums/Integration-config-key.enum';
import { ITeam } from '@libs/organization/domain/team/interfaces/team.interface';

export interface IIntegrationConfig<TIntegration = any, TTeam = ITeam> {
    uuid: string;
    configKey: IntegrationConfigKey;
    configValue: any;
    // Using a generic to break circular dependency with IIntegration
    integration?: Partial<TIntegration>;
    team?: Partial<TTeam>;
}
