import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { ImportFastFossyRulesDto } from '@libs/fossyRules/dtos/import-fast-fossy-rules.dto';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { FossyRuleSeverity } from '../../dtos/create-fossy-rule.dto';
import {
    FossyRulesScope,
    FossyRulesOrigin,
    FossyRulesStatus,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { validateAndScopeIdeRulePath } from '@libs/common/utils/fossy-rules/file-patterns';
import { createLogger } from '@libs/core/log/logger';

@Injectable()
export class ImportFastFossyRulesUseCase {
    private readonly logger = createLogger(ImportFastFossyRulesUseCase.name);

    constructor(
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        @Inject(REQUEST)
        private readonly request: Request & {
            user: {
                organization: { uuid: string };
                uuid: string;
                email: string;
            };
        },
    ) {}

    async execute(dto: ImportFastFossyRulesDto) {
        const organizationId = this.request.user?.organization?.uuid;
        if (!organizationId) {
            throw new Error('Organization ID not found');
        }

        const organizationAndTeamData: OrganizationAndTeamData = {
            organizationId,
            teamId: dto.teamId,
        };

        const results: any[] = [];

        for (const rule of dto.rules || []) {
            try {
                // Even though the payload is supposed to be pre-normalised
                // by the client, run it through the same validator the
                // sync flow uses so the persisted shape stays consistent
                // (no IDE-marker leaks, no path === sourcePath rows, no
                // empty paths).
                const validated = rule.sourcePath
                    ? validateAndScopeIdeRulePath({
                          llmPath: rule.path,
                          sourceFilePath: rule.sourcePath,
                          pathSource: (rule as any)?.pathSource,
                      })
                    : { path: rule.path || '**/*', reason: 'accepted-as-is' as const };
                if (validated.reason !== 'accepted-as-is') {
                    this.logger.log({
                        message: `[fossy-rules-import-fast] path validation: ${validated.reason}`,
                        context: ImportFastFossyRulesUseCase.name,
                        metadata: {
                            sourceFilePath: rule.sourcePath,
                            originalLlmPath: (validated as any)
                                .originalLlmPath,
                            finalPath: validated.path,
                            pathSource:
                                (rule as any)?.pathSource ?? 'unspecified',
                            repositoryId: rule.repositoryId,
                        },
                    });
                }

                const payload = {
                    title: rule.title,
                    rule: rule.rule,
                    path: validated.path,
                    sourcePath: rule.sourcePath,
                    severity:
                        (rule.severity as FossyRuleSeverity) ||
                        FossyRuleSeverity.MEDIUM,
                    scope: rule.scope || FossyRulesScope.FILE,
                    repositoryId: rule.repositoryId,
                    origin: FossyRulesOrigin.REPO_FILE_SYNC,
                    status: FossyRulesStatus.ACTIVE,
                    examples: Array.isArray(rule.examples) ? rule.examples : [],
                };

                const created =
                    await this.createOrUpdateFossyRulesUseCase.execute(
                        payload as any,
                        organizationId,
                        {
                            userId: this.request.user?.uuid || 'fossy-system',
                            userEmail:
                                (this.request.user as any)?.email ||
                                'fossy@fossa.local',
                        },
                        undefined,
                        undefined,
                        this.request.user,
                    );

                results.push(created);
            } catch (error) {
                this.logger.error({
                    message: 'Failed to import fast fossy rule',
                    context: ImportFastFossyRulesUseCase.name,
                    error,
                    metadata: {
                        ruleTitle: rule?.title,
                        repositoryId: rule?.repositoryId,
                        organizationAndTeamData,
                    },
                });
            }
        }

        return results;
    }
}
