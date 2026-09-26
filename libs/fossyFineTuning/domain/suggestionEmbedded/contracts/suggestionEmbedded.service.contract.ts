import { ISuggestionToEmbed } from '@libs/platformData/domain/pullRequests/interfaces/pullRequests.interface';

import { CodeSuggestion } from '@libs/core/infrastructure/config/types/general/codeReview.type';

import { ISuggestionEmbeddedRepository } from './suggestionEmbedded.repository.contract';
import { SuggestionEmbeddedEntity } from '../entities/suggestionEmbedded.entity';
import {
    SuggestionEmbeddedFeedbacks,
    SuggestionEmbeddedFeedbacksWithLanguage,
} from '../interfaces/suggestionEmbedded.interface';

export const SUGGESTION_EMBEDDED_SERVICE_TOKEN = Symbol(
    'SuggestionEmbeddedService',
);

export interface ISuggestionEmbeddedService extends ISuggestionEmbeddedRepository {
    bulkCreateFromMongoData(
        suggestions: ISuggestionToEmbed[],
    ): Promise<SuggestionEmbeddedEntity[] | undefined>;

    findByLanguage(language: string): Promise<SuggestionEmbeddedEntity[]>;

    findByFeedbackType(
        feedbackType: string,
    ): Promise<SuggestionEmbeddedEntity[]>;

    getByOrganization(
        organizationId: string,
    ): Promise<SuggestionEmbeddedFeedbacks>;

    getByRepositoryAndOrganization(
        repositoryId: string,
        organizationId: string,
    ): Promise<SuggestionEmbeddedFeedbacks>;

    getByOrganizationWithLanguages(
        organizationId: string,
    ): Promise<SuggestionEmbeddedFeedbacksWithLanguage>;

    getByRepositoryAndOrganizationWithLanguages(
        repositoryId: string,
        organizationId: string,
    ): Promise<SuggestionEmbeddedFeedbacksWithLanguage>;

    embedSuggestionsForISuggestionToEmbed(
        codeSuggestions: Partial<CodeSuggestion>[],
        organizationId: string,
        prNumber: number,
        repositoryId: string,
        repositoryFullName: string,
    ): Promise<ISuggestionToEmbed[]>;
}
