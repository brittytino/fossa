import { createLogger } from '@libs/core/log/logger';
import { CentralizedConfigPrService } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { CentralizedPrMetadata } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IFossyRule,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { buildFossyRuleCentralizedMutationRequest } from '@libs/centralized-config/utils/fossy-rules-centralized-pr.builder';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import { ChangeStatusFossyRulesDTO } from '@libs/fossyRules/dtos/change-status-fossy-rules.dto';
import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from './delete-rule-in-organization-by-id.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from './find-rules-in-organization-by-filter.use-case';

export class ChangeStatusFossyRulesUseCase {
    private readonly logger = createLogger(ChangeStatusFossyRulesUseCase.name);
    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly deleteRuleInOrganizationByIdFossyRulesUseCase: DeleteRuleInOrganizationByIdFossyRulesUseCase,
        private readonly centralizedConfigPrService: CentralizedConfigPrService,
        private readonly findRulesInOrganizationByRuleFilterFossyRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        private readonly authorizationService: AuthorizationService,
        @Inject(REQUEST)
        private readonly request: Request & {
            user: {
                organization: { uuid: string };
                uuid?: string;
                email?: string;
            };
        },
    ) {}

    async execute(
        body: ChangeStatusFossyRulesDTO,
    ): Promise<Array<Partial<IFossyRule> | IFossyRule> | CentralizedPrMetadata> {
        try {
            if (!this.request.user.organization.uuid) {
                throw new Error('Organization ID not found');
            }

            const { ruleIds, status } = body;
            const teamId =
                body.teamId ||
                (this.request.user as any)?.team?.uuid ||
                (this.request.user as any)?.teamId;
            const organizationAndTeamData = {
                organizationId: this.request.user.organization.uuid,
                teamId,
            };

            const rules =
                await this.findRulesInOrganizationByRuleFilterFossyRulesUseCase.execute(
                    this.request.user.organization.uuid,
                    {},
                );

            const rulesMap = new Map(rules.map((rule) => [rule.uuid, rule]));

            const targetRules = ruleIds.map((ruleId) => {
                const rule = rulesMap.get(ruleId);

                if (!rule) {
                    throw new Error(`Rule not found: ${ruleId}`);
                }

                return rule;
            });

            const repoIds = Array.from(
                new Set(
                    targetRules
                        .map((rule) => rule.repositoryId)
                        .filter((repoId): repoId is string => !!repoId),
                ),
            );

            await this.authorizationService.ensure({
                user: this.request.user,
                action: Action.Update,
                resource: ResourceType.FossyRules,
                repoIds,
            });

            const updated = [];
            let centralizedPrResult: CentralizedPrMetadata | null = null;
            const userInfo = {
                userId: this.request.user?.uuid || 'fossy-system',
                userEmail: this.request.user?.email || 'fossy@fossa.local',
            };

            const centralizedEnabled = Boolean(
                await this.centralizedConfigPrService.getCentralizedRepositoryIfEnabled(
                    organizationAndTeamData,
                ),
            );

            const shouldUseCentralizedDelete =
                status === FossyRulesStatus.DELETED && centralizedEnabled;

            for (const rule of targetRules) {
                let result:
                    | Partial<IFossyRule>
                    | IFossyRule
                    | CentralizedPrMetadata
                    | boolean
                    | null = null;

                if (
                    status === FossyRulesStatus.ACTIVE ||
                    status === FossyRulesStatus.PAUSED
                ) {
                    // Route through the centralized-aware upsert: when
                    // centralized config is on, this re-emits the rule file
                    // (paused → `enabled: false`) as a PR change instead of
                    // writing the status straight to the DB.
                    result = await this.createOrUpdateFossyRulesUseCase.execute(
                        {
                            ...(rule as any),
                            status,
                        },
                        organizationAndTeamData.organizationId,
                        userInfo,
                        true,
                        teamId,
                    );
                } else if (shouldUseCentralizedDelete) {
                    result =
                        await this.deleteRuleInOrganizationByIdFossyRulesUseCase.execute(
                            rule.uuid,
                            {
                                source: 'web',
                                organizationId:
                                    organizationAndTeamData.organizationId,
                                teamId,
                                userId: userInfo.userId,
                                userEmail: userInfo.userEmail,
                            },
                        );

                    if (typeof result === 'boolean') {
                        // Centralized delete routing should never return direct boolean.
                        throw new Error(
                            'Expected centralized PR metadata for delete operation',
                        );
                    }
                } else {
                    // Rejecting a pending item that was proposed into the
                    // centralized PR (it has a centralizedConfig path) must
                    // withdraw that proposal — otherwise the file lingers in
                    // the rolling PR and the rule reappears on merge.
                    if (
                        status === FossyRulesStatus.REJECTED &&
                        centralizedEnabled &&
                        rule.centralizedConfig?.path
                    ) {
                        await this.withdrawCentralizedProposal(
                            organizationAndTeamData,
                            rule,
                        );
                    }

                    result = await this.fossyRulesService.createOrUpdate(
                        organizationAndTeamData,
                        {
                            ...rule,
                            status,
                        },
                        userInfo,
                    );
                }

                if (!result) {
                    throw new Error(
                        'Failed to change status pending Fossy rule',
                    );
                }

                if (this.isCentralizedPrMetadata(result)) {
                    centralizedPrResult = result;
                } else {
                    updated.push(result);
                }
            }

            if (centralizedPrResult) {
                return centralizedPrResult;
            }

            return updated;
        } catch (error) {
            this.logger.error({
                message: 'Could not change status pending Fossy rules',
                context: ChangeStatusFossyRulesUseCase.name,
                serviceName: 'ChangeStatusPendingFossyRulesUseCase',
                error: error,
                metadata: {
                    body,
                },
            });
            throw error;
        }
    }

    private async withdrawCentralizedProposal(
        organizationAndTeamData: { organizationId: string; teamId?: string },
        rule: Partial<IFossyRule>,
    ): Promise<void> {
        const groupFolderName =
            await this.centralizedConfigPrService.resolveDirectoryGroupFolderName(
                organizationAndTeamData,
                rule.repositoryId,
                rule.directoryId,
            );

        await this.centralizedConfigPrService.createMutationPullRequestIfEnabled(
            buildFossyRuleCentralizedMutationRequest({
                centralizedConfigPrService: this.centralizedConfigPrService,
                organizationAndTeamData,
                repositoryId: rule.repositoryId,
                groupFolderName: groupFolderName ?? undefined,
                ruleContent: rule,
                ruleType: (rule.type as FossyRulesType) || FossyRulesType.STANDARD,
                operation: 'delete',
            }),
        );
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
}
