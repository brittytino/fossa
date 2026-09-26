import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    RuleLikeModel,
    RuleLikeSchema,
} from '../infrastructure/adapters/repositories/schemas/mongoose/rulesLikes.model';
import { RemoveRuleLikeUseCase } from '../application/use-cases/rule-like/remove-rule-like.use-case';
import { SetRuleLikeUseCase } from '../application/use-cases/rule-like/set-rule-like.use-case';
import { RULE_LIKE_SERVICE_TOKEN } from '../domain/contracts/ruleLike.service.contract';
import { RULE_LIKES_REPOSITORY_TOKEN } from '../domain/contracts/ruleLike.repository.contract';
import { RuleLikesService } from '../infrastructure/adapters/services/ruleLike.service';
import { RuleLikesRepository } from '../infrastructure/adapters/repositories/ruleLike.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: RuleLikeModel.name,
                schema: RuleLikeSchema,
            },
        ]),
    ],
    providers: [
        {
            provide: RULE_LIKES_REPOSITORY_TOKEN,
            useClass: RuleLikesRepository,
        },
        {
            provide: RULE_LIKE_SERVICE_TOKEN,
            useClass: RuleLikesService,
        },
        RemoveRuleLikeUseCase,
        SetRuleLikeUseCase,
    ],
    exports: [
        RULE_LIKES_REPOSITORY_TOKEN,
        RULE_LIKE_SERVICE_TOKEN,
        RemoveRuleLikeUseCase,
        SetRuleLikeUseCase,
    ],
})
export class RuleLikeModule {}
