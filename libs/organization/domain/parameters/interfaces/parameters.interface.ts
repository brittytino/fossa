import { ParametersKey } from '@libs/core/domain/enums/parameters-key.enum';
import { ITeam } from '@libs/organization/domain/team/interfaces/team.interface';

import { ConfigValueMap } from '../types/configValue.type';

export interface IParameters<K extends ParametersKey> {
    uuid: string;
    team?: Partial<ITeam>;
    configKey: K;
    configValue: ConfigValueMap[K];
    createdAt?: Date;
    updatedAt?: Date;
    active: boolean;
    description?: string;
    version: number;
}
