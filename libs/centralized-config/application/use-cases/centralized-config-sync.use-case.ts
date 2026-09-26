import { createLogger } from '@libs/core/log/logger';
import {
    CENTRALIZED_CONFIG_SERVICE_TOKEN,
    IConfigFileMeta,
    ICentralizedConfigService,
    IFossyRuleFileMeta,
} from '@libs/centralized-config/domain/contracts/CentralizedConfigService.contract';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CentralizedConfigSyncUseCase implements IUseCase {
    private readonly logger = createLogger(CentralizedConfigSyncUseCase.name);

    constructor(
        @Inject(CENTRALIZED_CONFIG_SERVICE_TOKEN)
        private readonly centralizedConfigService: ICentralizedConfigService,
    ) {}

    async execute(params: {
        organizationAndTeamData: OrganizationAndTeamData;
        repository?: { name: string; id: string };
    }): Promise<{
        success: boolean;
        message: string;
    }> {
        const { organizationAndTeamData } = params;

        try {
            // Validate centralized config is enabled and configured
            const validation =
                await this.centralizedConfigService.validateCentralizedConfig(
                    params,
                );
            if (!validation.success) {
                return validation;
            }

            this.logger.log({
                message: 'Starting centralized config sync',
                context: CentralizedConfigSyncUseCase.name,
                metadata: {
                    organizationAndTeamData,
                },
            });

            const actor = {
                organizationId: organizationAndTeamData.organizationId,
                source: 'sync' as const,
                userEmail: 'fossy@fossa.local',
                userId: 'fossy',
            };

            // Get the centralized config repository
            const repository =
                await this.centralizedConfigService.getCentralizedConfigRepository(
                    organizationAndTeamData,
                );

            // Discover config files in the repository
            const configFilesMeta =
                await this.centralizedConfigService.discoverConfigFiles({
                    organizationAndTeamData,
                    repository,
                });

            // Discover Fossy rule files in the repository
            const ruleFilesMeta =
                await this.centralizedConfigService.discoverFossyRulesFiles({
                    organizationAndTeamData,
                    repository,
                });

            const configScopesToSync = this.mergeConfigScopes(
                configFilesMeta,
                ruleFilesMeta,
            );

            // Synchronize configs
            const syncResult =
                await this.centralizedConfigService.synchronizeConfigs({
                    organizationAndTeamData,
                    configFiles: configScopesToSync,
                    actor,
                });

            if (!syncResult.success) {
                this.logger.error({
                    message: 'Failed to synchronize configs',
                    context: CentralizedConfigSyncUseCase.name,
                    metadata: {
                        organizationAndTeamData,
                        message: syncResult.message,
                    },
                });

                return {
                    success: false,
                    message: `Failed to synchronize configs: ${syncResult.message}`,
                };
            }

            // Synchronize Fossy rules
            const syncRulesResult =
                await this.centralizedConfigService.synchronizeFossyRules({
                    organizationAndTeamData,
                    ruleFiles: ruleFilesMeta,
                    actor,
                });

            if (!syncRulesResult.success) {
                this.logger.error({
                    message: 'Failed to synchronize Fossy rules',
                    context: CentralizedConfigSyncUseCase.name,
                    metadata: {
                        organizationAndTeamData,
                        message: syncRulesResult.message,
                    },
                });

                return {
                    success: false,
                    message: `Failed to synchronize Fossy rules: ${syncRulesResult.message}`,
                };
            }

            // Remove stale Fossy rules
            const cleanupRulesResult =
                await this.centralizedConfigService.removeStaleFossyRules({
                    organizationAndTeamData,
                    ruleFiles: ruleFilesMeta,
                    // Same tree read as the rules: proof the repository was
                    // reachable, so an empty rule set means the user deleted
                    // them rather than the read having failed.
                    configFiles: configFilesMeta,
                    actor,
                });

            if (!cleanupRulesResult.success) {
                this.logger.error({
                    message: 'Failed to remove stale Fossy rules',
                    context: CentralizedConfigSyncUseCase.name,
                    metadata: {
                        organizationAndTeamData,
                        message: cleanupRulesResult.message,
                    },
                });

                return {
                    success: false,
                    message: `Failed to remove stale Fossy rules: ${cleanupRulesResult.message}`,
                };
            }

            // Remove stale configs
            const cleanupResult =
                await this.centralizedConfigService.removeStaleConfigs({
                    organizationAndTeamData,
                    configFiles: configScopesToSync,
                    actor,
                });

            if (!cleanupResult.success) {
                this.logger.error({
                    message: 'Failed to remove stale configs',
                    context: CentralizedConfigSyncUseCase.name,
                    metadata: {
                        organizationAndTeamData,
                        message: cleanupResult.message,
                    },
                });

                return {
                    success: false,
                    message: `Failed to remove stale configs: ${cleanupResult.message}`,
                };
            }

            return {
                success: true,
                message: 'Centralized config sync completed successfully',
            };
        } catch (error) {
            this.logger.error({
                message: 'Error syncing centralized config',
                context: CentralizedConfigSyncUseCase.name,
                metadata: {
                    organizationAndTeamData,
                },
                error,
            });

            return {
                success: false,
                message: 'Error syncing centralized config',
            };
        }
    }

    private mergeConfigScopes(
        configFiles: IConfigFileMeta[],
        ruleFiles: IFossyRuleFileMeta[],
    ): IConfigFileMeta[] {
        const buildScopeKey = (scope: {
            repositoryId?: string;
            directoryPath?: string;
            directoryPaths?: string[];
        }) => {
            const repoKey = scope.repositoryId ?? 'global';
            // Directory-group scopes are identified by their full path set
            // (sorted to be order-invariant) — using `directoryPath` alone
            // collapses every group into the same bucket as the repo-level
            // config because discovery now leaves `directoryPath` empty for
            // groups.
            if (
                scope.directoryPaths &&
                scope.directoryPaths.length > 0
            ) {
                return `${repoKey}::group::${[...scope.directoryPaths].sort().join('|')}`;
            }
            return `${repoKey}::${scope.directoryPath ?? ''}`;
        };

        const mergedByScope = new Map<string, IConfigFileMeta>();

        for (const configFile of configFiles) {
            mergedByScope.set(buildScopeKey(configFile), configFile);
        }

        for (const ruleFile of ruleFiles) {
            const ruleScope: IConfigFileMeta = {
                repositoryId: ruleFile.repositoryId,
                directoryPath: ruleFile.directoryPath,
                directoryPaths: ruleFile.directoryPaths,
                centralizedDirectoryPath: ruleFile.centralizedDirectoryPath,
            };

            const scopeKey = buildScopeKey(ruleScope);
            if (!mergedByScope.has(scopeKey)) {
                mergedByScope.set(scopeKey, ruleScope);
            }
        }

        return Array.from(mergedByScope.values());
    }
}
