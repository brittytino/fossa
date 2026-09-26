import { IPermissionsRepository } from './permissions.repository.contract';

export const PERMISSIONS_SERVICE_TOKEN = Symbol.for('PermissionsService');

export interface IPermissionsService extends IPermissionsRepository {}
