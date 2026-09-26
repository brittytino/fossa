import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindManyOptions,
    FindOneOptions,
    Raw,
    Repository,
    UpdateQueryBuilder,
} from 'typeorm';

import { ProfileConfigModel } from './schemas/profileConfig.model';

import { IProfileConfigRepository } from '@libs/identity/domain/profile-configs/contracts/profileConfig.repository.contract';
import { ProfileConfigEntity } from '@libs/identity/domain/profile-configs/entities/profileConfig.entity';
import { IProfileConfig } from '@libs/identity/domain/profile-configs/interfaces/profileConfig.interface';
import { createNestedConditions } from '@libs/core/infrastructure/repositories/model/filters';
import {
    mapSimpleModelsToEntities,
    mapSimpleModelToEntity,
} from '@libs/core/infrastructure/repositories/mappers';

@Injectable()
export class ProfileConfigRepository implements IProfileConfigRepository {
    constructor(
        @InjectRepository(ProfileConfigModel)
        private readonly profileConfigRepository: Repository<ProfileConfigModel>,
    ) {}

    async find(
        filter?: Partial<IProfileConfig>,
    ): Promise<ProfileConfigEntity[]> {
        try {
            const { profile, ...otherFilterAttributes } = filter || {};

            const profileCondition = createNestedConditions('profile', profile);

            const findOptions: FindManyOptions<ProfileConfigModel> = {
                where: {
                    ...otherFilterAttributes,
                    ...profileCondition,
                },
            };

            const profileConfigModel =
                await this.profileConfigRepository.find(findOptions);

            return mapSimpleModelsToEntities(
                profileConfigModel,
                ProfileConfigEntity,
            );
        } catch (error) {
            console.log(error);
        }
    }
    async findOne(
        filter?: Partial<IProfileConfig>,
    ): Promise<ProfileConfigEntity> {
        try {
            const { profile, configValue, ...otherFilterAttributes } =
                filter || {};

            const profileCondition = createNestedConditions('profile', profile);

            const findOptions: FindManyOptions<ProfileConfigModel> = {
                where: {
                    ...otherFilterAttributes,
                    ...profileCondition,
                },
                relations: [
                    'profile',
                    'profile.user',
                    'profile.user.organization',
                ],
            };

            if (configValue && Object.keys(configValue)?.length > 0) {
                findOptions.where = {
                    ...findOptions.where,
                    configValue: Raw((alias) => `${alias} @> :configValue`, {
                        configValue: JSON.stringify(configValue),
                    }),
                };
            }

            const profileConfigModel =
                await this.profileConfigRepository.findOne(findOptions);

            return mapSimpleModelToEntity(
                profileConfigModel,
                ProfileConfigEntity,
            );
        } catch (error) {
            console.log(error);
        }
    }
    async create(profileConfig: IProfileConfig): Promise<ProfileConfigEntity> {
        try {
            const queryBuilder =
                this.profileConfigRepository.createQueryBuilder(
                    'profile_configs',
                );

            const profileConfigModel =
                this.profileConfigRepository.create(profileConfig);

            const profileConfigCreated = await queryBuilder
                .insert()
                .values(profileConfigModel)
                .execute();

            if (profileConfigCreated?.identifiers[0]?.uuid) {
                const findOneOptions: FindOneOptions<ProfileConfigModel> = {
                    where: {
                        uuid: profileConfigCreated.identifiers[0].uuid,
                    },
                };

                const profileConfig =
                    await this.profileConfigRepository.findOne(findOneOptions);

                return mapSimpleModelToEntity(
                    profileConfig,
                    ProfileConfigEntity,
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    async update(
        filter: Partial<IProfileConfig>,
        data: Partial<IProfileConfig>,
    ): Promise<ProfileConfigEntity> {
        try {
            const queryBuilder: UpdateQueryBuilder<ProfileConfigModel> =
                this.profileConfigRepository
                    .createQueryBuilder('profile_configs')
                    .update(ProfileConfigModel)
                    .where(filter)
                    .set(data);

            const result = await queryBuilder.execute();

            if (result.affected > 0) {
                const { profile, ...otherFilterAttributes } = filter || {};

                const profileCondition = createNestedConditions(
                    'profile',
                    profile,
                );

                const findOptions: FindManyOptions<ProfileConfigModel> = {
                    where: {
                        ...otherFilterAttributes,
                        ...profileCondition,
                    },
                };

                const integrationConfig =
                    await this.profileConfigRepository.findOne(findOptions);

                return mapSimpleModelToEntity(
                    integrationConfig,
                    ProfileConfigEntity,
                );
            }

            return undefined;
        } catch (error) {
            console.log(error);
        }
    }

    async delete(uuid: string): Promise<void> {
        try {
            await this.profileConfigRepository.delete(uuid);
        } catch (error) {
            console.log(error);
        }
    }
}
