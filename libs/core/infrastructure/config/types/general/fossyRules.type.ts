import { ProgrammingLanguage } from '@libs/core/domain/enums';

export type FossyRulesExamples = {
    snippet: string;
    isCorrect: boolean;
};

export type LibraryFossyRule = {
    uuid: string;
    title: string;
    rule: string;
    why_is_this_important: string;
    severity?: string;
    /**
     * Optional list of MCP providers (display hint for UI).
     * Examples: ["Sentry", "Datadog"], ["Linear", "Jira"].
     */
    examples?: FossyRulesExamples[];
    tags?: string[];
    buckets?: string[];
    language?: string;
    scope?: string;
    bad_example?: string;
    good_example?: string;
    // Feedback fields - optional (only appears if user is logged in)
    positiveCount?: number;
    negativeCount?: number;
    userFeedback?: 'positive' | 'negative' | null;
    plug_and_play?: boolean;
};

export type BucketInfo = {
    slug: string;
    title: string;
    description: string;
    rulesCount: number;
};

export type FossyRuleFilters = {
    title?: string;
    severity?: string;
    tags?: string[];
    language?: ProgrammingLanguage;
    buckets?: string[];
    plug_and_play?: boolean;
};
