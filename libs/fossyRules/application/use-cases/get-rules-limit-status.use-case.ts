import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';

@Injectable()
export class GetRulesLimitStatusUseCase {
    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    async execute(): Promise<{
        total: number;
    }> {
        const organizationId = this.request.user.organization.uuid;

        if (!organizationId) {
            throw new Error('Organization ID not found');
        }

        return this.fossyRulesService.getRulesLimitStatus({
            organizationId,
        });
    }
}
