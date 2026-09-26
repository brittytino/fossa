import { Entity } from '@libs/core/domain/interfaces/entity';

import { IPermissions } from '../types/permissions.types';

export class PermissionsEntity implements Entity<IPermissions> {
    private _uuid: string;
    private _permissions: IPermissions['permissions'];
    private _user: Partial<IPermissions['user']>;

    private constructor(permissions: IPermissions | Partial<IPermissions>) {
        this._uuid = permissions.uuid;
        this._permissions = permissions.permissions || {
            assignedRepositoryIds: [],
        };
        this._user = permissions.user || {};
    }

    public static create(
        permissions: IPermissions | Partial<IPermissions>,
    ): PermissionsEntity {
        return new PermissionsEntity(permissions);
    }

    public toObject(): IPermissions {
        return {
            uuid: this.uuid,
            permissions: this.permissions,
            user: this.user,
        };
    }

    public toJson(): IPermissions {
        return this.toObject();
    }

    public get uuid() {
        return this._uuid;
    }

    public get permissions() {
        return { ...this._permissions };
    }

    public get user() {
        return this._user;
    }
}
