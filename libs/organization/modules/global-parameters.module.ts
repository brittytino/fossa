import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalParametersModel } from '../infrastructure/adapters/repositories/schemas/global-parameters.model';
import { GlobalParametersRepository } from '../infrastructure/adapters/repositories/global-parameters.repository';
import { GlobalParametersService } from '../infrastructure/adapters/services/global-parameters.service';
import { GLOBAL_PARAMETERS_REPOSITORY_TOKEN } from '../domain/global-parameters/contracts/global-parameters.repository.contracts';
import { GLOBAL_PARAMETERS_SERVICE_TOKEN } from '../domain/global-parameters/contracts/global-parameters.service.contract';

@Module({
    imports: [TypeOrmModule.forFeature([GlobalParametersModel])],
    providers: [
        {
            provide: GLOBAL_PARAMETERS_REPOSITORY_TOKEN,
            useClass: GlobalParametersRepository,
        },
        {
            provide: GLOBAL_PARAMETERS_SERVICE_TOKEN,
            useClass: GlobalParametersService,
        },
    ],
    exports: [
        GLOBAL_PARAMETERS_REPOSITORY_TOKEN,
        GLOBAL_PARAMETERS_SERVICE_TOKEN,
    ],
})
export class GlobalParametersModule {}
