import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IFossyRule,
    FossyRulesOrigin,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { CentralizedPrMetadata } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';

import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { AddLibraryFossyRulesDto } from '@libs/fossyRules/dtos/add-library-fossy-rules.dto';
import { CreateFossyRuleDto } from '../../dtos/create-fossy-rule.dto';

@Injectable()
export class AddLibraryFossyRulesUseCase {
    private readonly logger = createLogger(AddLibraryFossyRulesUseCase.name);
    constructor(
        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly authorizationService: AuthorizationService,
    ) {}

    async execute(
        libraryFossyRules: AddLibraryFossyRulesDto,
    ): Promise<Partial<IFossyRule>[] | CentralizedPrMetadata> {
        try {
            if (!this.request.user.organization.uuid) {
                throw new Error('Organization ID not found');
            }

            await this.authorizationService.ensure({
                user: this.request.user,
                action: Action.Create,
                resource: ResourceType.FossyRules,
                repoIds:
                    libraryFossyRules.repositoriesIds.length > 0
                        ? libraryFossyRules.repositoriesIds
                        : undefined,
            });

            const results: Partial<IFossyRule>[] = [];
            let centralizedPrResult: CentralizedPrMetadata | null = null;

            for await (const repoId of libraryFossyRules.repositoriesIds) {
                const fossyRule: CreateFossyRuleDto = {
                    title: libraryFossyRules.title,
                    rule: libraryFossyRules.rule,
                    path: libraryFossyRules.path,
                    severity: libraryFossyRules.severity,
                    repositoryId: repoId,
                    examples: libraryFossyRules.examples,
                    origin: FossyRulesOrigin.LIBRARY,
                    type: FossyRulesType.STANDARD,
                };

                const result =
                    await this.createOrUpdateFossyRulesUseCase.execute(
                        fossyRule,
                        this.request.user.organization.uuid,
                        undefined,
                        undefined,
                        libraryFossyRules.teamId,
                        this.request.user,
                    );

                if (!result) {
                    throw new Error('Failed to add library Fossy rule');
                }
                if (
                    (result as CentralizedPrMetadata)?.mode === 'centralized-pr'
                ) {
                    centralizedPrResult = result as CentralizedPrMetadata;
                } else {
                    results.push(result);
                }
            }

            // Processar diretórios se existirem
            if (
                libraryFossyRules?.directoriesInfo &&
                libraryFossyRules?.directoriesInfo?.length > 0
            ) {
                for await (const directoryInfo of libraryFossyRules.directoriesInfo) {
                    const fossyRule: CreateFossyRuleDto = {
                        title: libraryFossyRules.title,
                        rule: libraryFossyRules.rule,
                        path: libraryFossyRules.path,
                        severity: libraryFossyRules.severity,
                        repositoryId: directoryInfo.repositoryId,
                        directoryId: directoryInfo.directoryId,
                        examples: libraryFossyRules.examples,
                        origin: FossyRulesOrigin.LIBRARY,
                        type: FossyRulesType.STANDARD,
                    };

                    const result =
                        await this.createOrUpdateFossyRulesUseCase.execute(
                            fossyRule,
                            this.request.user.organization.uuid,
                            undefined,
                            undefined,
                            libraryFossyRules.teamId,
                            this.request.user,
                        );

                    if (!result) {
                        throw new Error(
                            'Failed to add library Fossy rule for directory',
                        );
                    }
                    if (
                        (result as CentralizedPrMetadata)?.mode ===
                        'centralized-pr'
                    ) {
                        centralizedPrResult = result as CentralizedPrMetadata;
                    } else {
                        results.push(result);
                    }
                }
            }

            if (centralizedPrResult) {
                return centralizedPrResult;
            }

            return results;
        } catch (error) {
            this.logger.error({
                message: 'Could not add library Fossy rules',
                context: AddLibraryFossyRulesUseCase.name,
                serviceName: 'AddLibraryFossyRulesUseCase',
                error: error,
                metadata: {
                    libraryFossyRules,
                    organizationAndTeamData: {
                        organizationId: this.request.user.organization.uuid,
                    },
                },
            });
            throw error;
        }
    }
}
