import { IPermissions } from '../types/permissions.types';

export const PERMISSIONS_REPOSITORY_TOKEN = Symbol.for('PermissionsRepository');

export interface IPermissionsRepository {
    find(filter: Partial<IPermissions>): Promise<IPermissions[]>;
    findOne(filter: Partial<IPermissions>): Promise<IPermissions | null>;
    create(
        permissions: Omit<IPermissions, 'uuid'>,
    ): Promise<IPermissions | null>;
    update(
        uuid: string,
        permissions: Omit<Partial<IPermissions>, 'uuid'>,
    ): Promise<IPermissions | null>;
    delete(uuid: string): Promise<void>;
}
