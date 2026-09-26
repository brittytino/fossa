import { GlobalParametersKey } from '@libs/core/domain/enums/global-parameters-key.enum';

export interface IGlobalParameters {
    uuid: string;
    configKey: GlobalParametersKey;
    configValue: any;
    updatedAt?: Date;
}
