import { ProgrammingLanguage } from '@libs/core/domain/enums';

import { RuleLikeEntity, RuleFeedbackType } from '../entities/ruleLike.entity';

export const RULE_LIKE_SERVICE_TOKEN = 'RULE_LIKE_SERVICE_TOKEN';

export interface IRuleLikeService {
    getNativeCollection(): any;
    setFeedback(
        ruleId: string,
        feedback: RuleFeedbackType,
        userId?: string,
    ): Promise<RuleLikeEntity | null>;
    countByRule(ruleId: string): Promise<number>;
    topByLanguage(
        language: ProgrammingLanguage,
        limit?: number,
    ): Promise<{ ruleId: string; count: number }[]>;
    findOne(filter?: Partial<RuleLikeEntity>): Promise<RuleLikeEntity | null>;
    find(filter?: Partial<RuleLikeEntity>): Promise<RuleLikeEntity[]>;
    getAllLikes(): Promise<RuleLikeEntity[]>;
    getAllRulesWithFeedback(userId?: string): Promise<
        {
            ruleId: string;
            positiveCount: number;
            negativeCount: number;
            userFeedback: RuleFeedbackType | null;
        }[]
    >;
    removeFeedback(ruleId: string, userId?: string): Promise<boolean>;
}
