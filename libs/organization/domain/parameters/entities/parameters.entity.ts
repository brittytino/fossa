import { ParametersKey } from '@libs/core/domain/enums/parameters-key.enum';
import { ITeam } from '@libs/organization/domain/team/interfaces/team.interface';

import { IParameters } from '../interfaces/parameters.interface';
import { ConfigValueMap } from '../types/configValue.type';

export class ParametersEntity<
    K extends ParametersKey,
> implements IParameters<K> {
    private _uuid: string;
    private _active: boolean;
    private _configKey: K;
    private _configValue: ConfigValueMap[K];
    private _team?: Partial<ITeam>;
    private _createdAt?: Date;
    private _updatedAt?: Date;
    private _description?: string;
    private _version: number;

    constructor(parameters: IParameters<K> | Partial<IParameters<K>>) {
        this._uuid = parameters.uuid;
        this._configKey = parameters.configKey;
        this._configValue = parameters.configValue;
        this._team = parameters.team;
        this._createdAt = parameters.createdAt;
        this._updatedAt = parameters.updatedAt;
        this._active = parameters.active;
        this._version = parameters.version;
    }

    public static create<K extends ParametersKey>(
        parameters: IParameters<K> | Partial<IParameters<K>>,
    ) {
        return new ParametersEntity(parameters);
    }

    public toJson(): IParameters<K> {
        return {
            uuid: this.uuid,
            configKey: this.configKey,
            configValue: this.configValue,
            team: this.team,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            active: this.active,
            description: this.description,
            version: this.version,
        };
    }

    public toObject(): IParameters<K> {
        return this.toJson();
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

    public get team() {
        return this._team;
    }

    public get createdAt() {
        return this._createdAt;
    }

    public get updatedAt() {
        return this._updatedAt;
    }

    public get active() {
        return this._active;
    }

    public get description() {
        return this._description;
    }

    public get version() {
        return this._version;
    }
}
