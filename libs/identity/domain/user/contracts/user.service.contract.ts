import { IUserRepository } from './user.repository.contract';
import { UserEntity } from '../entities/user.entity';
import { IUser } from '../interfaces/user.interface';

export const USER_SERVICE_TOKEN = Symbol.for('UserService');

export interface IUsersService extends IUserRepository {
    checkPassword(email: string, password: string): Promise<boolean>;
    register(payload: Omit<IUser, 'uuid'>): Promise<UserEntity>;
}
