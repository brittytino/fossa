import { IOrganization } from '@libs/organization/domain/organization/interfaces/organization.interface';
import { IUser } from '@libs/identity/domain/user/interfaces/user.interface';

export interface ICliDevice {
    uuid: string;
    deviceId: string;
    deviceTokenHash: string;
    organization?: Partial<IOrganization>;
    user?: Partial<IUser>;
    lastSeenAt?: Date;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
