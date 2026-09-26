import { IProfile } from '@libs/identity/domain/profile/interfaces/profile.interface';

import { IProfileRepository } from './profile.repository.contract';

export const PROFILE_SERVICE_TOKEN = Symbol.for('ProfileService');

export interface IProfileService extends IProfileRepository {
    updateByUserId(user_id: string, data: Partial<IProfile>): Promise<void>;
}
