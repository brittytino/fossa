import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuggestionEmbeddedModel } from './infrastructure/adapters/repositories/schemas/suggestionEmbedded.model';
import { SuggestionEmbeddedService } from './infrastructure/adapters/services/suggestionEmbedded/suggestionEmbedded.service';
import { SUGGESTION_EMBEDDED_REPOSITORY_TOKEN } from './domain/suggestionEmbedded/contracts/suggestionEmbedded.repository.contract';
import { SUGGESTION_EMBEDDED_SERVICE_TOKEN } from './domain/suggestionEmbedded/contracts/suggestionEmbedded.service.contract';
import { SuggestionEmbeddedDatabaseRepository } from './infrastructure/adapters/repositories/suggestionEmbedded.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SuggestionEmbeddedModel])],
    providers: [
        {
            provide: SUGGESTION_EMBEDDED_REPOSITORY_TOKEN,
            useClass: SuggestionEmbeddedDatabaseRepository,
        },
        SuggestionEmbeddedDatabaseRepository, // Explicitly provide the class
        {
            provide: SUGGESTION_EMBEDDED_SERVICE_TOKEN,
            useClass: SuggestionEmbeddedService,
        },
    ],
    exports: [
        SUGGESTION_EMBEDDED_REPOSITORY_TOKEN,
        SUGGESTION_EMBEDDED_SERVICE_TOKEN,
    ],
})
export class SuggestionEmbeddedModule {}
