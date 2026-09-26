import { QueryFilter } from 'mongoose';

import { RuleLikeEntity, RuleFeedbackType } from '../entities/ruleLike.entity';
import { RuleLikeModel } from '@libs/fossyRules/infrastructure/adapters/repositories/schemas/mongoose/rulesLikes.model';

export interface IRuleLike {
    _id?: string;
    language: string;
    ruleId: string;
    userId?: string;
    feedback: RuleFeedbackType;
}

export const RULE_LIKES_REPOSITORY_TOKEN = Symbol.for('RuleLikesRepository');

export interface IRuleLikeRepository {
    getNativeCollection(): any;

    setFeedback(
        ruleId: string,
        feedback: RuleFeedbackType,
        userId?: string,
    ): Promise<RuleLikeEntity | null>;

    findOne(filter?: Partial<IRuleLike>): Promise<RuleLikeEntity | null>;

    find(filter?: QueryFilter<RuleLikeModel>): Promise<RuleLikeEntity[]>;

    countByRule(ruleId: string): Promise<number>;

    topByLanguage(
        language: string,
        limit?: number,
    ): Promise<{ ruleId: string; count: number }[]>;

    getAllLikes(): Promise<RuleLikeEntity[]>;

    getAllRulesWithFeedback(userId?: string): Promise<
        {
            ruleId: string;
            positiveCount: number;
            negativeCount: number;
            userFeedback: RuleFeedbackType | null;
        }[]
    >;

    unlike(ruleId: string, userId?: string): Promise<boolean>;
}
