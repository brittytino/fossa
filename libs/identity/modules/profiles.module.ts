import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UseCases } from '../application/use-cases/profile';
import { ProfileModel } from '../infrastructure/adapters/repositories/schemas/profile.model';
import { ProfilesService } from '../infrastructure/adapters/services/profile.service';
import { PROFILE_SERVICE_TOKEN } from '../domain/profile/contracts/profile.service.contract';
import { PROFILE_REPOSITORY_TOKEN } from '../domain/profile/contracts/profile.repository.contract';
import { CreateProfileUseCase } from '../application/use-cases/profile/create.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/profile/update.use-case';
import { SaveMarketingSurveyUseCase } from '../application/use-cases/profile/save-marketing-survey.use-case';
import { ProfileDatabaseRepository } from '../infrastructure/adapters/repositories/profile.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ProfileModel])],
    providers: [
        ...UseCases,
        {
            provide: PROFILE_REPOSITORY_TOKEN,
            useClass: ProfileDatabaseRepository,
        },
        {
            provide: PROFILE_SERVICE_TOKEN,
            useClass: ProfilesService,
        },
    ],
    exports: [
        PROFILE_SERVICE_TOKEN,
        PROFILE_REPOSITORY_TOKEN,
        CreateProfileUseCase,
        UpdateProfileUseCase,
        SaveMarketingSurveyUseCase,
    ],
    controllers: [],
})
export class ProfilesModule {}
