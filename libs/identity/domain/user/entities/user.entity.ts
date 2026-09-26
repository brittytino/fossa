import { Entity } from '@libs/core/domain/interfaces/entity';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { IOrganization } from '@libs/organization/domain/organization/interfaces/organization.interface';
import { ITeamMember } from '@libs/organization/domain/teamMembers/interfaces/teamMembers.interface';

import { Role } from '../../permissions/enums/permissions.enum';
import { IPermissions } from '../../permissions/types/permissions.types';
import { IUser } from '../interfaces/user.interface';

export class UserEntity implements Entity<IUser> {
    private _uuid: string;
    private _email: string;
    private _password: string;
    private _role: Role;
    private _organization?: Partial<IOrganization>;
    private _status: STATUS;
    private _teamMember?: Partial<ITeamMember>[];
    private _permissions?: Partial<IPermissions>;

    private constructor(user: IUser | Partial<IUser>) {
        this._uuid = user.uuid;
        this._email = user.email;
        this._password = user.password;
        this._role = user.role;
        this._organization = user.organization;
        this._status = user.status;
        this._teamMember = user.teamMember;
        this._permissions = user.permissions;
    }

    public static create(user: IUser | Partial<IUser>): UserEntity {
        return new UserEntity(user);
    }

    public get uuid() {
        return this._uuid;
    }

    public get email() {
        return this._email;
    }

    public get password() {
        return this._password;
    }

    public get role() {
        return this._role;
    }

    public get organization() {
        return this._organization;
    }

    public get status() {
        return this._status;
    }

    public get teamMember() {
        return this._teamMember;
    }

    public get permissions() {
        return this._permissions;
    }

    public toObject(): IUser {
        return {
            uuid: this._uuid,
            email: this._email,
            password: undefined,
            role: this._role,
            organization: this._organization,
            status: this._status,
            teamMember: this._teamMember,
            permissions: this._permissions,
        };
    }

    public toJson(): Partial<IUser> {
        return {
            email: this._email,
        };
    }
}
