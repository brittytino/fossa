import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { USER_SERVICE_TOKEN } from '@libs/identity/domain/user/contracts/user.service.contract';
import { UsersService } from '@libs/identity/infrastructure/adapters/services/users.service';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';

@Injectable()
export class DeleteUserUseCase implements IUseCase {
    constructor(
        @Inject(USER_SERVICE_TOKEN)
        private readonly usersService: UsersService,
    ) {}

    public async execute(uuid: string): Promise<void> {
        const userExists = await this.usersService.count({ uuid });

        if (!userExists) {
            throw new NotFoundException('api.users.not_found');
        }

        await this.usersService.delete(uuid);
    }
}
