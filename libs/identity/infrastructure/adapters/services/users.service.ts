import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { CryptoService } from '@libs/core/crypto/crypto.service';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';
import {
    IUserRepository,
    USER_REPOSITORY_TOKEN,
} from '@libs/identity/domain/user/contracts/user.repository.contract';
import { IUsersService } from '@libs/identity/domain/user/contracts/user.service.contract';
import { UserEntity } from '@libs/identity/domain/user/entities/user.entity';
import { IUser } from '@libs/identity/domain/user/interfaces/user.interface';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        private readonly cryptoService: CryptoService,
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
    ) {}

    public getCryptedPassword(email: string): Promise<string | undefined> {
        return this.userRepository.getCryptedPassword(email);
    }

    public create(userEntity: IUser): Promise<UserEntity | undefined> {
        return this.userRepository.create(userEntity);
    }

    public find(
        filter: Partial<IUser>,
        statusArray?: STATUS[],
    ): Promise<UserEntity[]> {
        return this.userRepository.find(filter, statusArray);
    }

    public findOne(filter: Partial<IUser>): Promise<UserEntity> {
        return this.userRepository.findOne(filter);
    }

    public count(filter: Partial<IUser>): Promise<number> {
        return this.userRepository.count(filter);
    }

    public getLoginData(email: string): Promise<UserEntity> {
        return this.userRepository.getLoginData(email);
    }

    public findById(uuid: string): Promise<UserEntity> {
        return this.userRepository.findById(uuid);
    }

    public async checkPassword(
        email: string,
        password: string,
    ): Promise<boolean> {
        const cryptedPassword =
            await this.userRepository.getCryptedPassword(email);
        if (cryptedPassword) {
            const passwordMatches = await this.cryptoService.match(
                password,
                cryptedPassword,
            );

            return passwordMatches;
        }

        return false;
    }

    public async register(payload: Omit<IUser, 'uuid'>): Promise<UserEntity> {
        const uuid = uuidv4();
        const password = await this.cryptoService.hashPassword(
            payload.password,
            10,
        );

        return this.userRepository.create({
            ...payload,
            uuid,
            password,
        });
    }

    // public updateProfile(
    //     userId: string,
    //     data: Partial<ProfileEntity>,
    // ): Promise<IProfile> {
    //     return this.userRepository.updateProfile(userId, data);
    // }

    public update(
        filter: Partial<IUser>,
        data: Partial<IUser>,
    ): Promise<UserEntity> {
        return this.userRepository.update(filter, data);
    }

    public async delete(uuid: string): Promise<void> {
        await this.userRepository.delete(uuid);
    }

    async findProfileIdsByOrganizationAndRole(
        organizationId: string,
        role: Role,
    ): Promise<string[]> {
        return this.userRepository.findProfileIdsByOrganizationAndRole(
            organizationId,
            role,
        );
    }

    async findUsersWithEmailsInDifferentOrganizations(
        emails: string[],
        organizationId: string,
    ) {
        return this.userRepository.findUsersWithEmailsInDifferentOrganizations(
            emails,
            organizationId,
        );
    }
}
