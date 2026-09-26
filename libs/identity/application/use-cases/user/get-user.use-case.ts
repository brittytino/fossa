import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import {
    IUsersService,
    USER_SERVICE_TOKEN,
} from '@libs/identity/domain/user/contracts/user.service.contract';
import { IUser } from '@libs/identity/domain/user/interfaces/user.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable() // @Case()
export class GetUserUseCase implements IUseCase {
    constructor(
        @Inject(USER_SERVICE_TOKEN)
        private readonly usersService: IUsersService,

        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    public async execute(): Promise<IUser> {
        const userId = this.request.user?.uuid;

        const userExists = await this.usersService.count({ uuid: userId });

        if (!userExists) {
            throw new NotFoundException('api.users.not_found');
        }

        const user = await this.usersService.findOne({ uuid: userId });

        return user.toObject();
    }
}
