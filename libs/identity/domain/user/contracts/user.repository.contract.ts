import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';

import { Role } from '../../permissions/enums/permissions.enum';
import { UserEntity } from '../entities/user.entity';
import { IUser } from '../interfaces/user.interface';

export const USER_REPOSITORY_TOKEN = Symbol.for('UserRepository');

export interface IUserRepository {
    find(filter: Partial<IUser>): Promise<UserEntity[]>;
    getLoginData(email: string): Promise<UserEntity | undefined>;
    find(filter: Partial<IUser>, statusArray?: STATUS[]): Promise<UserEntity[]>;
    findOne(filter: Partial<IUser>): Promise<UserEntity | undefined>;
    count(filter: Partial<IUser>): Promise<number>;
    // getLoginData(email: string): Promise<UserEntity | undefined>;
    getCryptedPassword(email: string): Promise<string | undefined>;
    findById(uuid: string): Promise<UserEntity | undefined>;
    create(userEntity: IUser): Promise<UserEntity | undefined>;
    update(
        filter: Partial<IUser>,
        data: Partial<IUser>,
    ): Promise<UserEntity | undefined>;
    delete(uuid: string): Promise<void>;

    findProfileIdsByOrganizationAndRole(
        organizationId: string,
        role: Role,
    ): Promise<string[]>;
    findUsersWithEmailsInDifferentOrganizations(
        emails: string[],
        organizationId: string,
    );
}
