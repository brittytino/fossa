import { Inject, Injectable } from '@nestjs/common';

import {
    IUsersService,
    USER_SERVICE_TOKEN,
} from '@libs/identity/domain/user/contracts/user.service.contract';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { DuplicateRecordException } from '@libs/core/infrastructure/filters/duplicate-record.exception';

@Injectable()
export class CheckUserWithEmailUserUseCase implements IUseCase {
    constructor(
        @Inject(USER_SERVICE_TOKEN)
        private readonly usersService: IUsersService,
    ) {}
    public async execute(email: any): Promise<boolean> {
        const previousUser = await this.usersService.count({
            email,
        });

        if (previousUser) {
            throw new DuplicateRecordException(
                'An user with this e-mail already exists.',
                'DUPLICATE_USER_EMAIL',
            );
        }

        return !!previousUser;
    }
}
