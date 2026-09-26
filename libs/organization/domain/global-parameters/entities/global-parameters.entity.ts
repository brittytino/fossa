import { GlobalParametersKey } from '@libs/core/domain/enums/global-parameters-key.enum';

import { IGlobalParameters } from '../interfaces/global-parameters.interface';

export class GlobalParametersEntity implements IGlobalParameters {
    private _uuid: string;
    private _configKey: GlobalParametersKey;
    private _configValue: any;
    private _updatedAt?: Date;

    constructor(
        globalParameters: IGlobalParameters | Partial<IGlobalParameters>,
    ) {
        this._uuid = globalParameters.uuid;
        this._configKey = globalParameters.configKey;
        this._configValue = globalParameters.configValue;
        this._updatedAt = globalParameters.updatedAt;
    }

    public static create(
        globalParameters: IGlobalParameters | Partial<IGlobalParameters>,
    ) {
        return new GlobalParametersEntity(globalParameters);
    }

    public get uuid() {
        return this._uuid;
    }

    public get configKey() {
        return this._configKey;
    }

    public get configValue() {
        return this._configValue;
    }

    public get updatedAt() {
        return this._updatedAt;
    }
}
