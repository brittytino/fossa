import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindManyOptions,
    FindOneOptions,
    Repository,
    UpdateQueryBuilder,
} from 'typeorm';

import { GlobalParametersModel } from './schemas/global-parameters.model';

import { IGlobalParametersRepository } from '@libs/organization/domain/global-parameters/contracts/global-parameters.repository.contracts';
import { GlobalParametersEntity } from '@libs/organization/domain/global-parameters/entities/global-parameters.entity';
import { IGlobalParameters } from '@libs/organization/domain/global-parameters/interfaces/global-parameters.interface';
import { GlobalParametersKey } from '@libs/core/domain/enums/global-parameters-key.enum';
import {
    mapSimpleModelToEntity,
    mapSimpleModelsToEntities,
} from '@libs/core/infrastructure/repositories/mappers';

@Injectable()
export class GlobalParametersRepository implements IGlobalParametersRepository {
    constructor(
        @InjectRepository(GlobalParametersModel)
        private readonly globalParametersRepository: Repository<GlobalParametersModel>,
    ) {}

    async find(
        filter?: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity[]> {
        const findOptions: FindManyOptions<GlobalParametersModel> = {
            where: filter,
        };

        const globalParametersModel =
            await this.globalParametersRepository.find(findOptions);

        return mapSimpleModelsToEntities(
            globalParametersModel,
            GlobalParametersEntity,
        );
    }

    async findOne(
        filter?: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity> {
        const findOptions: FindManyOptions<GlobalParametersModel> = {
            where: filter,
        };

        const globalParametersModel =
            await this.globalParametersRepository.findOne(findOptions);

        return mapSimpleModelToEntity(
            globalParametersModel,
            GlobalParametersEntity,
        );
    }

    async findById(uuid: string): Promise<GlobalParametersEntity> {
        const queryBuilder =
            this.globalParametersRepository.createQueryBuilder(
                'global_parameters',
            );

        const globalParametersSelected = await queryBuilder
            .where('global_parameters.uuid = :uuid', { uuid })
            .getOne();

        return mapSimpleModelToEntity(
            globalParametersSelected,
            GlobalParametersEntity,
        );
    }

    async create(
        globalParameter: IGlobalParameters,
    ): Promise<GlobalParametersEntity> {
        const queryBuilder =
            this.globalParametersRepository.createQueryBuilder(
                'global_parameters',
            );

        const globalParametersModel =
            this.globalParametersRepository.create(globalParameter);

        const globalParametersCreated = await queryBuilder
            .insert()
            .values(globalParametersModel)
            .execute();

        if (globalParametersCreated?.identifiers[0]?.uuid) {
            const findOneOptions: FindOneOptions<GlobalParametersModel> = {
                where: {
                    uuid: globalParametersCreated.identifiers[0].uuid,
                },
            };

            const globalParameters =
                await this.globalParametersRepository.findOne(findOneOptions);

            if (!globalParameters) return undefined;

            return mapSimpleModelToEntity(
                globalParameters,
                GlobalParametersEntity,
            );
        }
    }

    async update(
        filter: Partial<IGlobalParameters>,
        data: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity> {
        const queryBuilder: UpdateQueryBuilder<GlobalParametersModel> =
            this.globalParametersRepository
                .createQueryBuilder('global_parameters')
                .update(GlobalParametersModel)
                .where(filter)
                .set(data);

        const result = await queryBuilder.execute();

        if (result.affected > 0) {
            const findOptions: FindManyOptions<GlobalParametersModel> = {
                where: filter,
            };

            const globalParameters =
                await this.globalParametersRepository.findOne(findOptions);

            if (globalParameters) {
                return mapSimpleModelToEntity(
                    globalParameters,
                    GlobalParametersEntity,
                );
            }
        }

        return undefined;
    }

    async delete(uuid: string): Promise<void> {
        await this.globalParametersRepository.delete(uuid);
    }

    async findByKey(
        configKey: GlobalParametersKey,
    ): Promise<GlobalParametersEntity> {
        const queryBuilder =
            this.globalParametersRepository.createQueryBuilder(
                'global_parameters',
            );

        const globalParametersSelected = await queryBuilder
            .where('global_parameters.configKey = :configKey', { configKey })
            .getOne();

        return mapSimpleModelToEntity(
            globalParametersSelected,
            GlobalParametersEntity,
        );
    }

    async findUpdatedAtByKey(
        configKey: GlobalParametersKey,
    ): Promise<Date | null> {
        const result = await this.globalParametersRepository
            .createQueryBuilder('global_parameters')
            .select('global_parameters.updatedAt', 'updatedAt')
            .where('global_parameters.configKey = :configKey', { configKey })
            .getRawOne();

        return result?.updatedAt ?? null;
    }
}
