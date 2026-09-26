import { AuthModel } from '@libs/identity/infrastructure/adapters/repositories/schemas/auth.model';

import { AuthEntity } from '../entities/auth.entity';
import { IAuth } from '../interfaces/auth.interface';

export const AUTH_REPOSITORY_TOKEN = Symbol.for('AuthRepository');

export interface IAuthRepository {
    saveRefreshToken(auth: IAuth): Promise<AuthEntity | undefined>;

    updateRefreshToken(auth: Partial<IAuth>): Promise<AuthEntity | undefined>;

    findRefreshToken(auth: Partial<IAuth>): Promise<AuthModel | undefined>;

    deactivateRefreshToken(auth: Partial<IAuth>): Promise<void>;
}
