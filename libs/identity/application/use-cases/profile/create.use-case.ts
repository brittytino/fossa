import { Inject } from '@nestjs/common';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    IProfileService,
    PROFILE_SERVICE_TOKEN,
} from '@libs/identity/domain/profile/contracts/profile.service.contract';
import { IProfile } from '@libs/identity/domain/profile/interfaces/profile.interface';

export class CreateProfileUseCase implements IUseCase {
    constructor(
        @Inject(PROFILE_SERVICE_TOKEN)
        private readonly profileService: IProfileService,
    ) {}

    public async execute(payload: Partial<IProfile>): Promise<void> {
        await this.profileService.updateByUserId(payload.user.uuid, {
            ...payload,
            name: payload?.name,
            status: true,
            user: {
                uuid: payload?.user?.uuid,
            },
        });
    }
}
