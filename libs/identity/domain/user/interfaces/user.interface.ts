import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { Role } from '../../permissions/enums/permissions.enum';
import { IPermissions } from '../../permissions/types/permissions.types';

export interface IUser<TOrg = any, TTeamMember = any> {
    uuid: string;
    password: string;
    email: string;
    status: STATUS;
    role: Role;
    organization?: Partial<TOrg> | null;
    teamMember?: Partial<TTeamMember>[] | null;
    permissions?: Partial<IPermissions<IUser<TOrg, TTeamMember>>> | null;
}
