import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PROFILE_CONFIG_REPOSITORY_TOKEN } from '../domain/profile-configs/contracts/profileConfig.repository.contract';
import { PROFILE_CONFIG_SERVICE_TOKEN } from '../domain/profile-configs/contracts/profileConfig.service.contract';
import { ProfileConfigModel } from '../infrastructure/adapters/repositories/schemas/profileConfig.model';
import { UserModule } from './user.module';
import { ProfilesModule } from './profiles.module';
import { ProfileConfigService } from '../infrastructure/adapters/services/profileConfig.service';
import { ProfileConfigRepository } from '../infrastructure/adapters/repositories/profileConfig.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProfileConfigModel]),
        forwardRef(() => UserModule),
        forwardRef(() => ProfilesModule),
    ],
    providers: [
        {
            provide: PROFILE_CONFIG_SERVICE_TOKEN,
            useClass: ProfileConfigService,
        },
        {
            provide: PROFILE_CONFIG_REPOSITORY_TOKEN,
            useClass: ProfileConfigRepository,
        },
    ],
    exports: [PROFILE_CONFIG_SERVICE_TOKEN, PROFILE_CONFIG_REPOSITORY_TOKEN],
})
export class ProfileConfigModule {}
