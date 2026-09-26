import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable } from '@nestjs/common';

import { BucketInfo } from '@libs/core/infrastructure/config/types/general/fossyRules.type';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';

@Injectable()
export class FindLibraryFossyRulesBucketsUseCase {
    private readonly logger = createLogger(
        FindLibraryFossyRulesBucketsUseCase.name,
    );
    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
    ) {}

    async execute(): Promise<BucketInfo[]> {
        try {
            const buckets =
                await this.fossyRulesService.getLibraryFossyRulesBuckets();
            return buckets;
        } catch (error) {
            this.logger.error({
                message: 'Error finding library Fossy Rules buckets',
                context: FindLibraryFossyRulesBucketsUseCase.name,
                error: error,
            });
            throw error;
        }
    }
}
