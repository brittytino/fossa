import { createLogger } from '@libs/core/log/logger';
import {
    CentralizedConfigPrService,
    CentralizedPrMetadata,
} from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import { RuleIdsDto } from '@libs/fossyRules/dtos/rule-ids.dto';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
    IFossyRule,
    FossyRulesStatus,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { ChangeStatusFossyRulesUseCase } from './change-status-fossy-rules.use-case';
import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from './find-rules-in-organization-by-filter.use-case';

@Injectable()
export class ConvertPendingUpdatesToNewUseCase {
    private readonly logger = createLogger(
        ConvertPendingUpdatesToNewUseCase.name,
    );

    constructor(
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly findRulesInOrganizationByRuleFilterFossyRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        private readonly changeStatusFossyRulesUseCase: ChangeStatusFossyRulesUseCase,
        private readonly centralizedConfigPrService: CentralizedConfigPrService,
        private readonly authorizationService: AuthorizationService,
        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    public async execute(
        body: RuleIdsDto,
    ): Promise<Array<Partial<IFossyRule>> | CentralizedPrMetadata> {
        const organizationId = this.request.user.organization.uuid;
        if (!organizationId) {
            throw new Error('Organization ID not found');
        }

        const teamId =
            body.teamId ||
            (this.request.user as any)?.team?.uuid ||
            (this.request.user as any)?.teamId;

        const rulesToConvert = await this.getRulesByIds(
            organizationId,
            body.ruleIds,
        );

        const repoIds = Array.from(
            new Set(
                rulesToConvert
                    .map((rule) => rule.repositoryId)
                    .filter((repoId): repoId is string => !!repoId),
            ),
        );

        await this.authorizationService.ensure({
            user: this.request.user,
            action: Action.Create,
            resource: ResourceType.FossyRules,
            repoIds,
        });

        const userInfo = {
            userId: this.request.user?.uuid || 'fossy-system',
            userEmail: this.request.user?.email || 'fossy@fossa.local',
        };

        const createdRules: Array<Partial<IFossyRule>> = [];
        let centralizedPrResult: CentralizedPrMetadata | null = null;

        for (const rule of rulesToConvert) {
            const created = await this.createOrUpdateFossyRulesUseCase.execute(
                {
                    ...rule,
                    uuid: undefined,
                    status: FossyRulesStatus.ACTIVE,
                    type: rule.type,
                    origin: rule.origin,
                    requestType: undefined,
                    targetRuleUuid: undefined,
                    resolvedAt: undefined,
                    resolvedBy: undefined,
                    centralizedConfig: undefined,
                },
                organizationId,
                userInfo,
                true,
                teamId,
            );

            if (created) {
                if (this.isCentralizedPrMetadata(created)) {
                    centralizedPrResult = created;
                } else {
                    createdRules.push(created);
                }

                await this.changeStatusFossyRulesUseCase.execute({
                    ruleIds: [rule.uuid],
                    status: FossyRulesStatus.REJECTED,
                });
            }
        }

        if (centralizedPrResult) {
            return centralizedPrResult;
        }

        return createdRules;
    }

    private isCentralizedPrMetadata(
        value: Partial<IFossyRule> | CentralizedPrMetadata,
    ): value is CentralizedPrMetadata {
        return (
            typeof value === 'object' &&
            value !== null &&
            'mode' in value &&
            (value as { mode?: string }).mode === 'centralized-pr'
        );
    }

    private async getRulesByIds(organizationId: string, ruleIds: string[]) {
        try {
            const allRules =
                await this.findRulesInOrganizationByRuleFilterFossyRulesUseCase.execute(
                    organizationId,
                    {},
                );

            const rulesById = new Map(
                allRules.map((rule) => [rule.uuid, rule]),
            );

            return ruleIds
                .map((id) => {
                    const found = rulesById.get(id);
                    if (!found) {
                        throw new Error(`Rule not found: ${id}`);
                    }
                    return found;
                })
                .filter(Boolean);
        } catch (error) {
            this.logger.error({
                message: 'Could not convert pending updates to new rules/memories',
                context: ConvertPendingUpdatesToNewUseCase.name,
                error,
                metadata: {
                    organizationId,
                    ruleIds,
                },
            });
            throw error;
        }
    }
}
