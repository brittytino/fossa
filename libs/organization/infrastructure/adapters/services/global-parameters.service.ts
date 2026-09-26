import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
    IGlobalParametersRepository,
    GLOBAL_PARAMETERS_REPOSITORY_TOKEN,
} from '@libs/organization/domain/global-parameters/contracts/global-parameters.repository.contracts';
import { IGlobalParametersService } from '@libs/organization/domain/global-parameters/contracts/global-parameters.service.contract';
import { GlobalParametersEntity } from '@libs/organization/domain/global-parameters/entities/global-parameters.entity';
import { IGlobalParameters } from '@libs/organization/domain/global-parameters/interfaces/global-parameters.interface';
import { GlobalParametersKey } from '@libs/core/domain/enums/global-parameters-key.enum';

@Injectable()
export class GlobalParametersService implements IGlobalParametersService {
    constructor(
        @Inject(GLOBAL_PARAMETERS_REPOSITORY_TOKEN)
        private readonly globalParametersRepository: IGlobalParametersRepository,
    ) {}

    find(
        filter?: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity[]> {
        return this.globalParametersRepository.find(filter);
    }

    findOne(
        filter?: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity> {
        return this.globalParametersRepository.findOne(filter);
    }

    findById(uuid: string): Promise<GlobalParametersEntity> {
        return this.globalParametersRepository.findById(uuid);
    }

    create(
        globalParameters: IGlobalParameters,
    ): Promise<GlobalParametersEntity> {
        return this.globalParametersRepository.create(globalParameters);
    }

    update(
        filter: Partial<IGlobalParameters>,
        data: Partial<IGlobalParameters>,
    ): Promise<GlobalParametersEntity> {
        return this.globalParametersRepository.update(filter, data);
    }

    delete(uuid: string): Promise<void> {
        return this.globalParametersRepository.delete(uuid);
    }

    async findByKey(
        configKey: GlobalParametersKey,
    ): Promise<GlobalParametersEntity> {
        return this.globalParametersRepository.findByKey(configKey);
    }

    async findUpdatedAtByKey(
        configKey: GlobalParametersKey,
    ): Promise<Date | null> {
        return this.globalParametersRepository.findUpdatedAtByKey(configKey);
    }

    async createOrUpdateConfig(
        parametersKey: GlobalParametersKey,
        configValue: any,
    ): Promise<GlobalParametersEntity | boolean> {
        try {
            const parameters = await this.findOne({
                configKey: parametersKey,
            });

            if (!parameters) {
                const uuid = uuidv4();

                return await this.create({
                    uuid: uuid,
                    configKey: parametersKey,
                    configValue: configValue,
                });
            } else {
                await this.update(
                    {
                        uuid: parameters?.uuid,
                    },
                    {
                        configKey: parametersKey,
                        configValue: configValue,
                    },
                );
                return true;
            }
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}
