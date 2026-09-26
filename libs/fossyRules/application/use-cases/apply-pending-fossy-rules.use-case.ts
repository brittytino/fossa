import { createLogger } from '@libs/core/log/logger';
import { CentralizedPrMetadata } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import { CreateFossyRuleDto } from '../../dtos/create-fossy-rule.dto';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import {
    IFossyRule,
    FossyRuleRequestType,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { RuleIdsDto } from '@libs/fossyRules/dtos/rule-ids.dto';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from './find-rules-in-organization-by-filter.use-case';

@Injectable()
export class ApplyPendingFossyRulesUseCase {
    private readonly logger = createLogger(ApplyPendingFossyRulesUseCase.name);

    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly findRulesInOrganizationByRuleFilterFossyRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        private readonly authorizationService: AuthorizationService,
        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    async execute(
        body: RuleIdsDto,
    ): Promise<Array<Partial<IFossyRule> | IFossyRule> | CentralizedPrMetadata> {
        try {
            const organizationId = this.request.user.organization.uuid;
            if (!organizationId) {
                throw new Error('Organization ID not found');
            }

            const teamId =
                body.teamId ||
                (this.request.user as any)?.team?.uuid ||
                (this.request.user as any)?.teamId;
            const organizationAndTeamData = { organizationId, teamId };
            const userInfo = {
                userId: this.request.user?.uuid || 'fossy-system',
                userEmail: this.request.user?.email || 'fossy@fossa.local',
            };

            const allRules =
                await this.findRulesInOrganizationByRuleFilterFossyRulesUseCase.execute(
                    organizationId,
                    {},
                );

            const rulesById = new Map(
                allRules.map((rule) => [rule.uuid, rule]),
            );
            const pendingRules = body.ruleIds.map((ruleId) => {
                const rule = rulesById.get(ruleId);
                if (!rule) {
                    throw new Error(`Rule not found: ${ruleId}`);
                }
                return rule;
            });

            const repoIds = Array.from(
                new Set([
                    ...pendingRules
                        .map((rule) => rule.repositoryId)
                        .filter((repoId): repoId is string => !!repoId),
                    ...pendingRules
                        .map((rule) =>
                            rule.targetRuleUuid
                                ? rulesById.get(rule.targetRuleUuid)
                                      ?.repositoryId
                                : undefined,
                        )
                        .filter((repoId): repoId is string => !!repoId),
                ]),
            );

            await this.authorizationService.ensure({
                user: this.request.user,
                action: Action.Update,
                resource: ResourceType.FossyRules,
                repoIds,
            });

            const applied: Array<Partial<IFossyRule> | IFossyRule> = [];
            let centralizedPrResult: CentralizedPrMetadata | null = null;

            for (const pendingRule of pendingRules) {
                if (
                    pendingRule.requestType ===
                        FossyRuleRequestType.UPDATE &&
                    pendingRule.targetRuleUuid
                ) {
                    const targetRule = rulesById.get(
                        pendingRule.targetRuleUuid,
                    );

                    if (!targetRule?.uuid) {
                        throw new Error(
                            `Target rule not found: ${pendingRule.targetRuleUuid}`,
                        );
                    }

                    const updatedTarget =
                        await this.createOrUpdateFossyRulesUseCase.execute(
                            this.toCreateOrUpdateDto({
                                ...targetRule,
                                title:
                                    pendingRule.title !== undefined
                                        ? pendingRule.title
                                        : targetRule.title,
                                rule:
                                    pendingRule.rule !== undefined
                                        ? pendingRule.rule
                                        : targetRule.rule,
                                path:
                                    pendingRule.path !== undefined
                                        ? pendingRule.path
                                        : targetRule.path,
                                directoryId:
                                    pendingRule.directoryId !== undefined
                                        ? pendingRule.directoryId
                                        : targetRule.directoryId,
                                status: FossyRulesStatus.ACTIVE,
                                requestType: undefined,
                                targetRuleUuid: undefined,
                                resolvedAt: undefined,
                                resolvedBy: undefined,
                            }),
                            organizationId,
                            userInfo,
                            true,
                            teamId,
                        );

                    if (!updatedTarget) {
                        throw new Error('Failed to apply pending update');
                    }

                    if (this.isCentralizedPrMetadata(updatedTarget)) {
                        centralizedPrResult = updatedTarget;
                    } else {
                        applied.push(updatedTarget);
                    }

                    const appliedPending =
                        await this.fossyRulesService.createOrUpdate(
                            organizationAndTeamData,
                            this.toCreateOrUpdateDto({
                                ...pendingRule,
                                status: FossyRulesStatus.APPLIED,
                                resolvedAt: new Date(),
                                resolvedBy: userInfo.userId,
                            }),
                            userInfo,
                        );

                    if (!appliedPending) {
                        throw new Error(
                            'Failed to mark pending update request as applied',
                        );
                    }
                    continue;
                }

                const activatedRule =
                    await this.createOrUpdateFossyRulesUseCase.execute(
                        this.toCreateOrUpdateDto({
                            ...pendingRule,
                            status: FossyRulesStatus.ACTIVE,
                        }),
                        organizationId,
                        userInfo,
                        true,
                        teamId,
                    );

                if (!activatedRule) {
                    throw new Error('Failed to apply pending rule');
                }

                if (this.isCentralizedPrMetadata(activatedRule)) {
                    centralizedPrResult = activatedRule;
                } else {
                    applied.push(activatedRule);
                }
            }

            if (centralizedPrResult) {
                return centralizedPrResult;
            }

            return applied;
        } catch (error) {
            this.logger.error({
                message: 'Could not apply pending fossy rules',
                context: ApplyPendingFossyRulesUseCase.name,
                error,
                metadata: {
                    body,
                },
            });
            throw error;
        }
    }

    private isCentralizedPrMetadata(
        value: Partial<IFossyRule> | IFossyRule | CentralizedPrMetadata,
    ): value is CentralizedPrMetadata {
        return (
            typeof value === 'object' &&
            value !== null &&
            'mode' in value &&
            (value as { mode?: string }).mode === 'centralized-pr'
        );
    }

    private toCreateOrUpdateDto(rule: Partial<IFossyRule>): CreateFossyRuleDto {
        if (!rule.uuid) {
            throw new Error('Rule ID is required');
        }
        if (!rule.title || !rule.rule || !rule.repositoryId) {
            throw new Error(`Invalid rule payload for rule ${rule.uuid}`);
        }

        return {
            ...(rule as CreateFossyRuleDto),
            type: rule.type || FossyRulesType.STANDARD,
            severity: (rule.severity as any) || 'medium',
            path: rule.path || '',
            examples: (rule.examples as any) || [],
        };
    }
}
