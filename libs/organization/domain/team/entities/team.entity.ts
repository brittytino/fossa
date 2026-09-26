import { Entity } from '@libs/core/domain/interfaces/entity';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { IOrganization } from '@libs/organization/domain/organization/interfaces/organization.interface';

import { ITeam } from '../interfaces/team.interface';

export class TeamEntity implements Entity<ITeam> {
    private _uuid: string;
    private _name: string;
    private _organization?: Partial<IOrganization>;
    private _status: STATUS;
    private _cliConfig?: any;

    private constructor(team: ITeam | Partial<ITeam>) {
        this._uuid = team.uuid;
        this._name = team.name;
        this._organization = team.organization;
        this._status = team.status;
        this._cliConfig = team.cliConfig;
    }

    public static create(team: ITeam | Partial<ITeam>): TeamEntity {
        return new TeamEntity(team);
    }

    public get uuid() {
        return this._uuid;
    }

    public get name() {
        return this._name;
    }

    public get organization() {
        return this._organization;
    }

    public get status() {
        return this._status;
    }

    public toObject(): ITeam {
        return {
            uuid: this._uuid,
            name: this._name,
            organization: this._organization,
            status: this._status,
            cliConfig: this._cliConfig,
        };
    }

    public toJson(): Partial<ITeam> {
        return {
            uuid: this._uuid,
            name: this._name,
            status: this._status,
            cliConfig: this._cliConfig,
        };
    }

    public get cliConfig() {
        return this._cliConfig;
    }
}
