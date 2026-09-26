import { IOrganization } from '@libs/organization/domain/organization/interfaces/organization.interface';

export interface ISuggestionEmbedded {
    uuid?: string;
    suggestionId: string;
    suggestionEmbed: number[];
    pullRequestNumber: number;
    repositoryId: string;
    repositoryFullName: string;
    organization?: Partial<IOrganization> | null;
    label: string;
    severity: string;
    feedbackType: string;
    improvedCode: string;
    suggestionContent: string;
    oneSentenceSummary?: string;
    language: string;
}

export interface SuggestionEmbeddedFeedbacks {
    positiveFeedbacks: number;
    negativeFeedbacks: number;
    total: number;
}

export interface SuggestionEmbeddedFeedbacksWithLanguage {
    positiveFeedbacks: {
        language: {
            language: string;
            count: number;
        }[];
        total: number;
    };
    negativeFeedbacks: {
        language: {
            language: string;
            count: number;
        }[];
        total: number;
    };
    total: number;
}
