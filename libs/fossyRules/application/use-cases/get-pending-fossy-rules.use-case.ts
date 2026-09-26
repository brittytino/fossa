import { Inject, Injectable, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    IFossyRule,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from './find-rules-in-organization-by-filter.use-case';

export interface PendingFossyRulesResult {
    items: Partial<IFossyRule>[];
    counts: { total: number; rules: number; memories: number };
}

/**
 * The single source for the Pending area: every pending Fossy Rule and Memory
 * for the org (optionally scoped to a repository), plus counts for the badge.
 * Items carry `type`/`origin`/`requestType`/`targetRuleUuid` so the UI can show
 * provenance and tell create-requests from update-requests.
 */
@Injectable()
export class GetPendingFossyRulesUseCase implements IUseCase {
    constructor(
        @Optional()
        @Inject(REQUEST)
        private readonly request: UserRequest,
        private readonly findRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
    ) {}

    async execute(
        params: { repositoryId?: string } = {},
    ): Promise<PendingFossyRulesResult> {
        const organizationId = this.request?.user?.organization?.uuid;
        if (!organizationId) {
            throw new Error('Organization ID not found');
        }

        const items = await this.findRulesUseCase.execute(
            organizationId,
            { status: FossyRulesStatus.PENDING },
            params.repositoryId,
        );

        const memories = items.filter(
            (rule) => rule.type === FossyRulesType.MEMORY,
        ).length;

        return {
            items,
            counts: {
                total: items.length,
                rules: items.length - memories,
                memories,
            },
        };
    }
}
