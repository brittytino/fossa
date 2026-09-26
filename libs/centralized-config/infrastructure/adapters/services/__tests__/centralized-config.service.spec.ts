import { createLogger } from '@libs/core/log/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { CODE_BASE_CONFIG_SERVICE_TOKEN } from '@libs/code-review/domain/contracts/CodeBaseConfigService.contract';
import { IConfigFileMeta } from '@libs/centralized-config/domain/contracts/CentralizedConfigService.contract';
import { ParametersKey } from '@libs/core/domain/enums';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { ConfigLevel } from '@libs/core/infrastructure/config/types/general/pullRequestMessages.type';
import { INTEGRATION_CONFIG_SERVICE_TOKEN } from '@libs/integrations/domain/integrationConfigs/contracts/integration-config.service.contracts';
import { CreateOrUpdateParametersUseCase } from '@libs/organization/application/use-cases/parameters/create-or-update-use-case';
import { PARAMETERS_SERVICE_TOKEN } from '@libs/organization/domain/parameters/contracts/parameters.service.contract';
import { CodeManagementService } from '@libs/platform/infrastructure/adapters/services/codeManagement.service';
import { DeleteRepositoryCodeReviewParameterUseCase } from '@libs/code-review/application/use-cases/configuration/delete-repository-code-review-parameter.use-case';
import { UpdateOrCreateCodeReviewParameterUseCase } from '@libs/code-review/application/use-cases/configuration/update-or-create-code-review-parameter-use-case';
import { CreateOrUpdatePullRequestMessagesUseCase } from '@libs/code-review/application/use-cases/pullRequestMessages/create-or-update-pull-request-messages.use-case';
import { PULL_REQUEST_MESSAGES_SERVICE_TOKEN } from '@libs/code-review/domain/pullRequestMessages/contracts/pullRequestMessages.service.contract';
import { CreateOrUpdateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/create-or-update.use-case';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/delete-rule-in-organization-by-id.use-case';
import { FOSSY_RULES_SERVICE_TOKEN } from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import * as yaml from 'js-yaml';
import { CentralizedConfigService } from '../centralized-config.service';

describe('CentralizedConfigService', () => {
    let service: CentralizedConfigService;
    let mockParametersService: any;
    let mockIntegrationConfigService: any;
    let mockCodeManagementService: any;
    let mockUpdateOrCreateCodeReviewParameterUseCase: any;
    let mockDeleteRepositoryCodeReviewParameterUseCase: any;
    let mockCreateOrUpdateParametersUseCase: any;
    let mockCreateOrUpdatePullRequestMessagesUseCase: any;
    let mockPullRequestMessagesService: any;
    let mockCodeBaseConfigService: any;
    let mockCreateOrUpdateFossyRulesUseCase: any;
    let mockDeleteRuleInOrganizationByIdFossyRulesUseCase: any;
    let mockFossyRulesService: any;

    const organizationAndTeamData: OrganizationAndTeamData = {
        organizationId: 'org-1',
        teamId: 'team-1',
    };

    const actor = {
        organizationId: 'org-1',
        source: 'sync' as const,
        userEmail: 'fossy@fossa.local',
        userId: 'fossy',
    };

    beforeEach(async () => {
        mockParametersService = {
            findByKey: jest.fn(),
            findOne: jest.fn(),
        };

        mockIntegrationConfigService = {
            findIntegrationConfigFormatted: jest.fn(),
        };

        mockCodeManagementService = {
            getRepositoryTree: jest.fn(),
            getRepositoryContentFile: jest.fn(),
            getDefaultBranch: jest.fn(),
        };

        mockUpdateOrCreateCodeReviewParameterUseCase = {
            execute: jest.fn(),
        };

        mockDeleteRepositoryCodeReviewParameterUseCase = {
            execute: jest.fn(),
        };

        mockCreateOrUpdateParametersUseCase = {
            execute: jest.fn(),
        };

        mockCreateOrUpdatePullRequestMessagesUseCase = {
            execute: jest.fn(),
        };

        mockPullRequestMessagesService = {
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
        };

        mockCodeBaseConfigService = {
            getFossaConfigFile: jest.fn(),
            getDirectoryIdForPath: jest.fn(),
        };

        mockCreateOrUpdateFossyRulesUseCase = {
            execute: jest.fn(),
        };

        mockDeleteRuleInOrganizationByIdFossyRulesUseCase = {
            execute: jest.fn(),
        };

        mockFossyRulesService = {
            find: jest.fn(),
            findByOrganizationId: jest.fn(),
            updateRulesStatusByFilter: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CentralizedConfigService,
                {
                    provide: PARAMETERS_SERVICE_TOKEN,
                    useValue: mockParametersService,
                },
                {
                    provide: INTEGRATION_CONFIG_SERVICE_TOKEN,
                    useValue: mockIntegrationConfigService,
                },
                {
                    provide: CodeManagementService,
                    useValue: mockCodeManagementService,
                },
                {
                    provide: UpdateOrCreateCodeReviewParameterUseCase,
                    useValue: mockUpdateOrCreateCodeReviewParameterUseCase,
                },
                {
                    provide: DeleteRepositoryCodeReviewParameterUseCase,
                    useValue: mockDeleteRepositoryCodeReviewParameterUseCase,
                },
                {
                    provide: CreateOrUpdateParametersUseCase,
                    useValue: mockCreateOrUpdateParametersUseCase,
                },
                {
                    provide: CreateOrUpdatePullRequestMessagesUseCase,
                    useValue: mockCreateOrUpdatePullRequestMessagesUseCase,
                },
                {
                    provide: PULL_REQUEST_MESSAGES_SERVICE_TOKEN,
                    useValue: mockPullRequestMessagesService,
                },
                {
                    provide: CODE_BASE_CONFIG_SERVICE_TOKEN,
                    useValue: mockCodeBaseConfigService,
                },
                {
                    provide: CreateOrUpdateFossyRulesUseCase,
                    useValue: mockCreateOrUpdateFossyRulesUseCase,
                },
                {
                    provide: DeleteRuleInOrganizationByIdFossyRulesUseCase,
                    useValue: mockDeleteRuleInOrganizationByIdFossyRulesUseCase,
                },
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: mockFossyRulesService,
                },
            ],
        }).compile();

        service = module.get<CentralizedConfigService>(
            CentralizedConfigService,
        );

        // Mock the logger to avoid console output during tests
        jest.spyOn(createLogger(''), 'log').mockImplementation(() => {});
        jest.spyOn(createLogger(''), 'error').mockImplementation(() => {});
        jest.spyOn(createLogger(''), 'warn').mockImplementation(() => {});
    });

    describe('synchronizeConfigs', () => {
        /**
         * Discovery emits `directoryPaths` (plural) and stopped setting
         * `directoryPath`. Keying the config level off the singular spelling
         * sent every directory scope down the REPOSITORY branch, so the
         * directory's custom messages were written onto the repository —
         * overwriting the repository's own messages and never creating a
         * directory-level one.
         *
         * Reproduced end to end before writing this: two files, one with
         * `MSG-DO-REPO` and one with `MSG-DO-DIRETORIO`, produced a single
         * message at repository level carrying the directory's content.
         */
        it('writes a directory scope custom message at DIRECTORY level', async () => {
            const configFiles: IConfigFileMeta[] = [
                {
                    repositoryId: 'repo-1',
                    centralizedDirectoryPath: 'repo1/src',
                    // What discovery actually emits for a directory scope.
                    directoryPaths: ['/src'],
                } as any,
            ];

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [{ id: 'repo-1', name: 'repo1', full_name: 'org/repo1' }],
            );
            mockCodeBaseConfigService.getDirectoryIdForPath.mockResolvedValue(
                'dir-1',
            );
            mockPullRequestMessagesService.findOne.mockResolvedValue(null);
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue({
                version: '2.0',
                customMessages: {
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'MSG-DO-DIRETORIO',
                    },
                },
            });
            mockParametersService.findByKey.mockImplementation((key) => {
                if (key === ParametersKey.CENTRALIZED_CONFIG) {
                    return Promise.resolve({
                        configValue: {
                            enabled: true,
                            repository: { id: 'c-1', name: 'centralized' },
                        },
                    });
                }
                return Promise.resolve({ configValue: {} });
            });

            await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            // Asserted on the payload directly: the use case takes three
            // arguments and `toHaveBeenCalledWith` matches arity too.
            const payload =
                mockCreateOrUpdatePullRequestMessagesUseCase.execute.mock
                    .calls[0][1];

            expect(payload).toEqual(
                expect.objectContaining({
                    configLevel: ConfigLevel.DIRECTORY,
                    repositoryId: 'repo-1',
                    directoryId: 'dir-1',
                }),
            );
        });

        it('should sync custom messages from centralized config', async () => {
            const configFiles: IConfigFileMeta[] = [
                {
                    repositoryId: 'repo-1',
                    centralizedDirectoryPath: 'repo1',
                    directoryPath: '/src',
                },
            ];

            const configFileWithCustomMessages = {
                version: '2.0',
                automatedReviewActive: true,
                customMessages: {
                    globalSettings: {
                        hideComments: false,
                        suggestionCopyPrompt: true,
                    },
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'Custom start message',
                    },
                    endReviewMessage: {
                        status: 'every_push',
                        content: 'Custom end message',
                    },
                },
            };

            // Mock repository lookup
            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [{ id: 'repo-1', name: 'repo1', full_name: 'org/repo1' }],
            );

            // Mock directory ID resolution
            mockCodeBaseConfigService.getDirectoryIdForPath.mockResolvedValue(
                'dir-1',
            );

            // Mock existing parent configs (empty for this test)
            mockPullRequestMessagesService.findOne.mockResolvedValue(null);

            // Mock config file fetch
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                configFileWithCustomMessages,
            );

            // Mock parameter operations - different mocks for different keys
            mockParametersService.findByKey.mockImplementation(
                (key, _orgAndTeamData) => {
                    if (key === ParametersKey.CENTRALIZED_CONFIG) {
                        return Promise.resolve({
                            configValue: {
                                enabled: true,
                                repository: {
                                    id: 'centralized-repo-1',
                                    name: 'centralized-repo',
                                },
                            },
                        });
                    }
                    if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                        return Promise.resolve({
                            configValue: {},
                        });
                    }
                    return Promise.resolve({
                        configValue: {},
                    });
                },
            );

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockCreateOrUpdatePullRequestMessagesUseCase.execute,
            ).toHaveBeenCalledWith(
                {
                    uuid: 'fossy',
                    email: 'fossy@fossa.local',
                    organization: { uuid: 'org-1' },
                },
                {
                    organizationId: 'org-1',
                    configLevel: ConfigLevel.DIRECTORY,
                    repositoryId: 'repo-1',
                    directoryId: 'dir-1',
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'Custom start message',
                    },
                    endReviewMessage: {
                        status: 'every_push',
                        content: 'Custom end message',
                    },
                    errorReviewMessage: {
                        status: 'off',
                        content: '',
                    },
                    globalSettings: {
                        hideComments: false,
                        suggestionCopyPrompt: true,
                    },
                },
                {
                    skipAuthorization: true,
                    skipCentralizedPr: true,
                },
            );

            // Verify customMessages are removed from the config stored in Postgres
            expect(
                mockUpdateOrCreateCodeReviewParameterUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    configValue: expect.not.objectContaining({
                        customMessages: expect.anything(),
                    }),
                }),
            );
        });

        it('should handle global config custom messages', async () => {
            const configFiles: IConfigFileMeta[] = [{}]; // Global config

            const configFileWithCustomMessages = {
                version: '2.0',
                automatedReviewActive: true,
                customMessages: {
                    globalSettings: {
                        hideComments: true,
                        suggestionCopyPrompt: false,
                    },
                    startReviewMessage: {
                        status: 'only_when_opened',
                        content: 'Global start message',
                    },
                    endReviewMessage: {
                        status: 'off',
                        content: '',
                    },
                },
            };

            // Mock config file fetch
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                configFileWithCustomMessages,
            );

            // Mock parameter operations - different mocks for different keys
            mockParametersService.findByKey.mockImplementation(
                (key, _orgAndTeamData) => {
                    if (key === ParametersKey.CENTRALIZED_CONFIG) {
                        return Promise.resolve({
                            configValue: {
                                enabled: true,
                                repository: {
                                    id: 'centralized-repo-1',
                                    name: 'centralized-repo',
                                },
                            },
                        });
                    }
                    if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                        return Promise.resolve({
                            configValue: {},
                        });
                    }
                    return Promise.resolve({
                        configValue: {},
                    });
                },
            );

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockCreateOrUpdatePullRequestMessagesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    organizationId: 'org-1',
                    configLevel: ConfigLevel.GLOBAL,
                    repositoryId: 'global',
                    directoryId: undefined,
                    startReviewMessage: {
                        status: 'only_when_opened',
                        content: 'Global start message',
                    },
                    endReviewMessage: {
                        status: 'off',
                        content: '',
                    },
                    errorReviewMessage: {
                        status: 'off',
                        content: '',
                    },
                    globalSettings: {
                        hideComments: true,
                        suggestionCopyPrompt: false,
                    },
                },
                {
                    skipAuthorization: true,
                    skipCentralizedPr: true,
                },
            );
        });

        it('should sync config file with only custom messages', async () => {
            const configFiles: IConfigFileMeta[] = [{}]; // Global config

            const configFileWithOnlyCustomMessages = {
                customMessages: {
                    globalSettings: {
                        hideComments: false,
                        suggestionCopyPrompt: true,
                    },
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'Custom start message',
                    },
                    endReviewMessage: {
                        status: 'every_push',
                        content: 'Custom end message',
                    },
                },
            };

            // Mock config file fetch
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                configFileWithOnlyCustomMessages,
            );

            // Mock parameter operations - different mocks for different keys
            mockParametersService.findByKey.mockImplementation(
                (key, _orgAndTeamData) => {
                    if (key === ParametersKey.CENTRALIZED_CONFIG) {
                        return Promise.resolve({
                            configValue: {
                                enabled: true,
                                repository: {
                                    id: 'centralized-repo-1',
                                    name: 'centralized-repo',
                                },
                            },
                        });
                    }
                    if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                        return Promise.resolve({
                            configValue: {},
                        });
                    }
                    return Promise.resolve({
                        configValue: {},
                    });
                },
            );

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockCreateOrUpdatePullRequestMessagesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    organizationId: 'org-1',
                    configLevel: ConfigLevel.GLOBAL,
                    repositoryId: 'global',
                    directoryId: undefined,
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'Custom start message',
                    },
                    endReviewMessage: {
                        status: 'every_push',
                        content: 'Custom end message',
                    },
                    errorReviewMessage: {
                        status: 'off',
                        content: '',
                    },
                    globalSettings: {
                        hideComments: false,
                        suggestionCopyPrompt: true,
                    },
                },
                {
                    skipAuthorization: true,
                    skipCentralizedPr: true,
                },
            );

            // Verify that customMessages are removed and only an empty config is stored in Postgres
            expect(
                mockUpdateOrCreateCodeReviewParameterUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    configValue: {},
                }),
            );
        });

        it('should skip custom messages sync when customMessages is not present', async () => {
            const configFiles: IConfigFileMeta[] = [{}];

            const configFileWithoutCustomMessages = {
                version: '2.0',
                automatedReviewActive: true,
            };

            // Mock config file fetch
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                configFileWithoutCustomMessages,
            );

            // Mock parameter operations - different mocks for different keys
            mockParametersService.findByKey.mockImplementation(
                (key, _orgAndTeamData) => {
                    if (key === ParametersKey.CENTRALIZED_CONFIG) {
                        return Promise.resolve({
                            configValue: {
                                enabled: true,
                                repository: {
                                    id: 'centralized-repo-1',
                                    name: 'centralized-repo',
                                },
                            },
                        });
                    }
                    if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                        return Promise.resolve({
                            configValue: {},
                        });
                    }
                    return Promise.resolve({
                        configValue: {},
                    });
                },
            );

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockCreateOrUpdatePullRequestMessagesUseCase.execute,
            ).not.toHaveBeenCalled();
        });

        it('should handle errors in custom messages sync gracefully', async () => {
            const configFiles: IConfigFileMeta[] = [{}];

            const configFileWithCustomMessages = {
                version: '2.0',
                automatedReviewActive: true,
                customMessages: {
                    globalSettings: {
                        hideComments: false,
                        suggestionCopyPrompt: true,
                    },
                    startReviewMessage: {
                        status: 'every_push',
                        content: 'Custom start message',
                    },
                    endReviewMessage: {
                        status: 'every_push',
                        content: 'Custom end message',
                    },
                },
            };

            // Mock config file fetch
            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                configFileWithCustomMessages,
            );

            // Mock parameter operations - different mocks for different keys
            mockParametersService.findByKey.mockImplementation(
                (key, _orgAndTeamData) => {
                    if (key === ParametersKey.CENTRALIZED_CONFIG) {
                        return Promise.resolve({
                            configValue: {
                                enabled: true,
                                repository: {
                                    id: 'centralized-repo-1',
                                    name: 'centralized-repo',
                                },
                            },
                        });
                    }
                    if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                        return Promise.resolve({
                            configValue: {},
                        });
                    }
                    return Promise.resolve({
                        configValue: {},
                    });
                },
            );

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            // Mock custom messages sync to fail
            mockCreateOrUpdatePullRequestMessagesUseCase.execute.mockRejectedValue(
                new Error('Custom messages sync failed'),
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            // Should still succeed because custom messages errors don't fail the whole sync
            expect(result.success).toBe(true);
            expect(result.message).toBe(
                'Config files synchronized successfully',
            );
        });

        it('should create empty config placeholders for rule-only scopes', async () => {
            const configFiles: IConfigFileMeta[] = [
                {
                    repositoryId: 'repo-1',
                    directoryPath: '/src',
                    centralizedDirectoryPath: 'repo-1/src/.fossy-rules/review',
                },
            ];

            mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue(
                null,
            );

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [{ id: 'repo-1', name: 'repo-1', full_name: 'org/repo-1' }],
            );

            mockCodeBaseConfigService.getDirectoryIdForPath.mockResolvedValue(
                'dir-1',
            );

            mockPullRequestMessagesService.findOne.mockResolvedValue({
                uuid: 'message-1',
            });

            mockParametersService.findByKey.mockImplementation((key) => {
                if (key === ParametersKey.CENTRALIZED_CONFIG) {
                    return Promise.resolve({
                        configValue: {
                            enabled: true,
                            repository: {
                                id: 'centralized-repo-1',
                                name: 'centralized-repo',
                            },
                        },
                    });
                }

                if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                    return Promise.resolve({
                        configValue: {},
                    });
                }

                return Promise.resolve({
                    configValue: {},
                });
            });

            mockUpdateOrCreateCodeReviewParameterUseCase.execute.mockResolvedValue(
                undefined,
            );

            const result = await service.synchronizeConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockUpdateOrCreateCodeReviewParameterUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    configValue: {},
                    repositoryId: 'repo-1',
                    directoryPath: '/src',
                }),
            );
            expect(
                mockCreateOrUpdatePullRequestMessagesUseCase.execute,
            ).not.toHaveBeenCalled();
            expect(mockPullRequestMessagesService.delete).toHaveBeenCalledWith(
                'message-1',
            );
        });
    });

    describe('removeStaleConfigs', () => {
        it('should remove stale custom messages even when regular config does not change', async () => {
            // Non-empty discovery (a repo scope) so the #1518 empty-discovery
            // guard does not trigger; the GLOBAL message is stale because a
            // previous sync owned a global config file that is gone now.
            const configFiles: IConfigFileMeta[] = [
                { repositoryId: 'repo-1' } as any,
            ];

            const codeReviewConfig = {
                configValue: {
                    configs: {},
                    repositories: [],
                },
            };

            mockParametersService.findByKey.mockImplementation((key) => {
                if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                    return Promise.resolve(codeReviewConfig);
                }

                if (key === ParametersKey.CENTRALIZED_CONFIG) {
                    // Ownership is what makes this a removal rather than a
                    // message the centralized config simply never managed.
                    return Promise.resolve({
                        configValue: { managedGlobalConfig: true },
                    });
                }

                return Promise.resolve({ configValue: {} });
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );

            mockPullRequestMessagesService.find.mockResolvedValue([
                {
                    uuid: 'global-message-1',
                    configLevel: ConfigLevel.GLOBAL,
                },
            ]);

            const result = await service.removeStaleConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(result.message).toBe('No stale configs to remove');
            expect(mockPullRequestMessagesService.delete).toHaveBeenCalledWith(
                'global-message-1',
            );
            // The code review config itself must not be rewritten. Sync does
            // record its managed-repository baseline (#1579), but that lives
            // under CENTRALIZED_CONFIG — a different key.
            expect(
                mockCreateOrUpdateParametersUseCase.execute,
            ).not.toHaveBeenCalledWith(
                ParametersKey.CODE_REVIEW_CONFIG,
                expect.anything(),
                expect.anything(),
            );
        });

        it('should NOT remove a global custom message it never owned', async () => {
            // Same discovery as above, one difference: no previous sync ever
            // owned a global `fossa-config.yml`. The message was authored in
            // the UI and the centralized config has no claim on it.
            const configFiles: IConfigFileMeta[] = [
                { repositoryId: 'repo-1' } as any,
            ];

            mockParametersService.findByKey.mockImplementation((key) => {
                if (key === ParametersKey.CODE_REVIEW_CONFIG) {
                    return Promise.resolve({
                        configValue: { configs: {}, repositories: [] },
                    });
                }

                return Promise.resolve({ configValue: {} });
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );

            mockPullRequestMessagesService.find.mockResolvedValue([
                { uuid: 'global-message-1', configLevel: ConfigLevel.GLOBAL },
            ]);

            const result = await service.removeStaleConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(mockPullRequestMessagesService.delete).not.toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------------
    // Issue #1518 — empty/failed discovery must NOT wipe data. A read failure
    // (repositories mapping unavailable, tree read failed) yields the same
    // empty result as a genuinely empty repo, and the non-transactional
    // reconcile then deleted every rule and reset the org's global config
    // (default model / BYOK) plus custom messages. These assert the SAFE
    // post-guard behavior and are the regression coverage for the fix.
    // ---------------------------------------------------------------------
    describe('#1518 empty-discovery wipe guard', () => {
        it('discoverFossyRulesFiles THROWS (not []) when the repositories mapping cannot be loaded', async () => {
            mockCodeManagementService.getRepositoryTree.mockResolvedValue([
                { type: 'file', path: 'my-repo/.fossy-rules/review/a.yml' },
            ]);
            // Transient integration-config read failure → null (a FAILURE, not
            // "zero files"). Must surface so the sync aborts before deletion.
            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                null,
            );

            await expect(
                service.discoverFossyRulesFiles({
                    organizationAndTeamData,
                    repository: { name: 'config-repo', id: 'repo-1' },
                }),
            ).rejects.toThrow();
        });

        it('discoverConfigFiles THROWS (not []) when the repositories mapping cannot be loaded', async () => {
            // Twin of discoverFossyRulesFiles — both go through scanRepositoryTree,
            // and both feed removeStale*, so both must fail loudly on a read error.
            mockCodeManagementService.getRepositoryTree.mockResolvedValue([
                { type: 'file', path: 'my-repo/fossa-config.yml' },
            ]);
            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                null,
            );

            await expect(
                service.discoverConfigFiles({
                    organizationAndTeamData,
                    repository: { name: 'config-repo', id: 'repo-1' },
                }),
            ).rejects.toThrow();
        });

        // H5 — a `fossa-config.yml` more than one level below the repository
        // folder is dropped by discovery with nothing but a log line. Executed
        // rather than assumed: this is what a user who hand-writes
        // `my-repo/src/api/fossa-config.yml` actually gets. Not a data-loss
        // bug — the file is ignored, not acted on — but the silence is the
        // problem, and any change to it is a product decision.
        it('discoverConfigFiles silently ignores a nested path deeper than one level', async () => {
            mockCodeManagementService.getRepositoryTree.mockResolvedValue([
                { type: 'file', path: 'my-repo/fossa-config.yml' },
                { type: 'file', path: 'my-repo/src/api/fossa-config.yml' },
            ]);
            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [{ id: 'r-1', name: 'my-repo', full_name: 'acme/my-repo' }],
            );

            const discovered = await service.discoverConfigFiles({
                organizationAndTeamData,
                repository: { name: 'config-repo', id: 'repo-1' },
            });

            // Only the repository-level file survives; the nested one is gone
            // and the caller has no way to know it existed.
            expect(discovered).toHaveLength(1);
            expect(discovered[0]).toEqual(
                expect.objectContaining({ repositoryId: 'r-1' }),
            );
            expect(discovered[0].directoryPaths).toBeUndefined();
        });

        it('removeStaleFossyRules does NOT delete centralized rules when discovery is empty', async () => {
            const ruleFiles: any[] = []; // empty discovery

            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'r1',
                            title: 'A',
                            centralizedConfig: {
                                path: '.fossy-rules/review/a.yml',
                            },
                        },
                        {
                            uuid: 'r2',
                            title: 'B',
                            centralizedConfig: {
                                path: '.fossy-rules/review/b.yml',
                            },
                        },
                    ],
                }),
            });

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(result.removedRuleCount).toBe(0);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).not.toHaveBeenCalled();
        });

        it('removeStaleConfigs does NOT reset global config / delete repo configs / delete messages when discovery is empty', async () => {
            const configFiles: IConfigFileMeta[] = []; // empty discovery

            const codeReviewConfig = {
                configValue: {
                    // org-wide defaults: LLM provider + model + BYOK reference
                    configs: {
                        llmProvider: 'openai_byok',
                        byokConfig: { apiKey: 'sk-live-secret' },
                    },
                    repositories: [
                        {
                            id: 'repo-1',
                            isSelected: true,
                            configs: { reviewOptions: { security: true } },
                            directories: [],
                        },
                    ],
                },
            };

            mockParametersService.findByKey.mockImplementation((key: any) =>
                key === ParametersKey.CODE_REVIEW_CONFIG
                    ? Promise.resolve(codeReviewConfig)
                    : Promise.resolve({ configValue: {} }),
            );
            mockPullRequestMessagesService.find.mockResolvedValue([
                { uuid: 'global-message-1', configLevel: ConfigLevel.GLOBAL },
            ]);

            const result = await service.removeStaleConfigs({
                organizationAndTeamData,
                configFiles,
                actor,
            });

            expect(result.success).toBe(true);
            // None of the destructive paths may fire on empty discovery.
            expect(
                mockCreateOrUpdateParametersUseCase.execute,
            ).not.toHaveBeenCalled();
            expect(
                mockDeleteRepositoryCodeReviewParameterUseCase.execute,
            ).not.toHaveBeenCalled();
            expect(
                mockPullRequestMessagesService.delete,
            ).not.toHaveBeenCalled();
        });
    });

    // Backfill for the four methods that had no direct unit test — the gap
    // that let #1518 through (methods only exercised via mocks in the use-case
    // spec, never their own logic).
    describe('untested method coverage', () => {
        describe('validateCentralizedConfig', () => {
            it('fails when centralized config is not enabled', async () => {
                mockParametersService.findByKey.mockResolvedValue({
                    configValue: { enabled: false },
                });
                const r = await service.validateCentralizedConfig({
                    organizationAndTeamData,
                });
                expect(r.success).toBe(false);
                expect(r.message).toContain('not enabled');
            });

            it('fails when enabled but no repository is configured', async () => {
                mockParametersService.findByKey.mockResolvedValue({
                    configValue: { enabled: true, repository: {} },
                });
                const r = await service.validateCentralizedConfig({
                    organizationAndTeamData,
                });
                expect(r.success).toBe(false);
                expect(r.message).toContain('no repository');
            });

            it('succeeds when enabled and a repository is configured', async () => {
                mockParametersService.findByKey.mockResolvedValue({
                    configValue: {
                        enabled: true,
                        repository: { id: 'r1', name: 'fossa' },
                    },
                });
                const r = await service.validateCentralizedConfig({
                    organizationAndTeamData,
                });
                expect(r.success).toBe(true);
            });
        });

        describe('getCentralizedConfigRepository', () => {
            it('returns the configured repository', async () => {
                mockParametersService.findByKey.mockResolvedValue({
                    configValue: { repository: { id: 'r1', name: 'fossa' } },
                });
                const repo =
                    await service.getCentralizedConfigRepository(
                        organizationAndTeamData,
                    );
                expect(repo).toEqual({ id: 'r1', name: 'fossa' });
            });

            it('throws when no repository is configured', async () => {
                mockParametersService.findByKey.mockResolvedValue({
                    configValue: {},
                });
                await expect(
                    service.getCentralizedConfigRepository(
                        organizationAndTeamData,
                    ),
                ).rejects.toThrow(
                    'Centralized config repository not configured',
                );
            });
        });

        describe('fetchConfigFile', () => {
            it('returns the config file on success', async () => {
                mockCodeBaseConfigService.getFossaConfigFile.mockResolvedValue({
                    version: 2,
                });
                const file = await service.fetchConfigFile({
                    organizationAndTeamData,
                    repository: { name: 'r', id: 'r1' },
                });
                expect(file).toEqual({ version: 2 });
            });

            it('returns null (does not throw) when the read fails', async () => {
                mockCodeBaseConfigService.getFossaConfigFile.mockRejectedValue(
                    new Error('boom'),
                );
                const file = await service.fetchConfigFile({
                    organizationAndTeamData,
                    repository: { name: 'r', id: 'r1' },
                });
                expect(file).toBeNull();
            });
        });

        describe('fetchFossyRuleFile', () => {
            it('returns null when the file has no content', async () => {
                mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                    'main',
                );
                mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                    { data: {} },
                );
                const rule = await service.fetchFossyRuleFile({
                    organizationAndTeamData,
                    repository: { name: 'r', id: 'r1' },
                    filePath: '.fossy-rules/review/a.yml',
                });
                expect(rule).toBeNull();
            });

            it('decodes and parses a base64 YAML rule file', async () => {
                mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                    'main',
                );
                const yamlContent = 'title: My rule\nrule: do the thing\n';
                mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                    {
                        data: {
                            content: Buffer.from(
                                yamlContent,
                                'utf-8',
                            ).toString('base64'),
                            encoding: 'base64',
                        },
                    },
                );
                const rule = await service.fetchFossyRuleFile({
                    organizationAndTeamData,
                    repository: { name: 'r', id: 'r1' },
                    filePath: '.fossy-rules/review/a.yml',
                });
                expect(rule).toMatchObject({ title: 'My rule' });
            });
        });
    });

    describe('discoverFossyRulesFiles', () => {
        it('should discover Fossy rule files from centralized repository', async () => {
            const mockRepoTree = [
                {
                    path: 'fossa-config.yml',
                    type: 'file' as const,
                },
                {
                    path: '.fossy-rules/memories/logging.yml',
                    type: 'file' as const,
                },
                {
                    path: '.fossy-rules/review/security.yml',
                    type: 'file' as const,
                },
                {
                    path: 'org-a/.fossy-rules/memories/auth.yml',
                    type: 'file' as const,
                },
                {
                    path: 'org-a/services%2Fapi/.fossy-rules/review/api.yml',
                    type: 'file' as const,
                },
            ];

            mockCodeManagementService.getRepositoryTree.mockResolvedValue(
                mockRepoTree,
            );

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [{ id: 'org-a-id', name: 'org-a', full_name: 'org-a' }],
            );

            const result = await service.discoverFossyRulesFiles({
                organizationAndTeamData,
                repository: { name: 'central-repo', id: 'central-repo-id' },
            });

            expect(result).toHaveLength(4);
            expect(result).toEqual(
                expect.arrayContaining([
                    {
                        centralizedDirectoryPath: '.fossy-rules/memories',
                        repositoryId: undefined,
                        directoryPath: undefined,
                        directoryPaths: undefined,
                        ruleType: 'memory' as any,
                        ruleFilePath: '.fossy-rules/memories/logging.yml',
                        path: '.fossy-rules/memories/logging.yml',
                    },
                    {
                        centralizedDirectoryPath: '.fossy-rules/review',
                        repositoryId: undefined,
                        directoryPath: undefined,
                        directoryPaths: undefined,
                        ruleType: 'standard' as any,
                        ruleFilePath: '.fossy-rules/review/security.yml',
                        path: '.fossy-rules/review/security.yml',
                    },
                    {
                        centralizedDirectoryPath: 'org-a/.fossy-rules/memories',
                        repositoryId: 'org-a-id',
                        directoryPath: undefined,
                        directoryPaths: undefined,
                        ruleType: 'memory' as any,
                        ruleFilePath: 'org-a/.fossy-rules/memories/auth.yml',
                        path: 'org-a/.fossy-rules/memories/auth.yml',
                    },
                    {
                        centralizedDirectoryPath:
                            'org-a/services%2Fapi/.fossy-rules/review',
                        repositoryId: 'org-a-id',
                        directoryPath: '/services/api',
                        directoryPaths: ['/services/api'],
                        ruleType: 'standard' as any,
                        ruleFilePath:
                            'org-a/services%2Fapi/.fossy-rules/review/api.yml',
                        path: 'org-a/services%2Fapi/.fossy-rules/review/api.yml',
                    },
                ]),
            );
        });

        it('should exclude files not in .fossy-rules directories', async () => {
            const mockRepoTree = [
                {
                    path: 'fossa-config.yml',
                    type: 'file' as const,
                },
                {
                    path: 'rules.yml',
                    type: 'file' as const,
                },
                {
                    path: '.fossy-rules/memories/logging.yml',
                    type: 'file' as const,
                },
            ];

            mockCodeManagementService.getRepositoryTree.mockResolvedValue(
                mockRepoTree,
            );

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );

            const result = await service.discoverFossyRulesFiles({
                organizationAndTeamData,
                repository: { name: 'central-repo', id: 'central-repo-id' },
            });

            expect(result).toHaveLength(1);
            expect(result[0].ruleFilePath).toBe(
                '.fossy-rules/memories/logging.yml',
            );
        });
    });

    describe('synchronizeFossyRules', () => {
        it('should synchronize Fossy rules successfully', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/memories',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'memory' as any,
                    ruleFilePath: '.fossy-rules/memories/logging.yml',
                    path: '.fossy-rules/memories/logging.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Logging Rule',
                rule: 'Use structured logging',
                examples: [
                    { snippet: 'console.log("test")', isCorrect: false },
                ],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'rule-uuid',
            });

            const result = await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(result.message).toContain(
                'Fossy rules synchronized successfully',
            );
            expect(result.syncedRuleCount).toBe(1);
            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Logging Rule',
                    rule: 'Use structured logging',
                    type: 'memory',
                    status: 'active',
                    repositoryId: 'global',
                    centralizedConfig: {
                        path: '.fossy-rules/memories/logging.yml',
                        status: 'synced',
                    },
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should update existing pending rule when sourcePath matches', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/review',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'standard' as any,
                    ruleFilePath: '.fossy-rules/review/security.yml',
                    path: '.fossy-rules/review/security.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Security Rule',
                rule: 'Never expose secrets',
                examples: [],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [
                    {
                        uuid: 'pending-rule-uuid',
                        status: 'pending',
                        origin: 'past_reviews',
                        centralizedConfig: {
                            path: '.fossy-rules/review/security.yml',
                            status: 'pending_edit',
                        },
                    },
                ],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'pending-rule-uuid',
            });

            const result = await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(result.success).toBe(true);
            // Sync must NOT auto-approve a rule that is awaiting approval, and
            // must not reclassify its origin — otherwise merging the
            // centralized-config PR silently approves every pending rule.
            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: 'pending-rule-uuid',
                    centralizedConfig: {
                        path: '.fossy-rules/review/security.yml',
                        status: 'synced',
                    },
                    status: 'pending',
                    origin: 'past_reviews',
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should NOT resurrect a rejected rule when sourcePath matches', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/review',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'standard' as any,
                    ruleFilePath: '.fossy-rules/review/rejected.yml',
                    path: '.fossy-rules/review/rejected.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Rejected Rule',
                rule: 'Should stay hidden',
                examples: [],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [
                    {
                        uuid: 'rejected-rule-uuid',
                        status: 'rejected',
                        centralizedConfig: {
                            path: '.fossy-rules/review/rejected.yml',
                            status: 'synced',
                        },
                    },
                ],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'rejected-rule-uuid',
            });

            await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: 'rejected-rule-uuid',
                    status: 'rejected',
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should update existing active rule when sourcePath matches', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/review',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'standard' as any,
                    ruleFilePath: '.fossy-rules/review/style.yml',
                    path: '.fossy-rules/review/style.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Style Rule',
                rule: 'Prefer const over let',
                examples: [],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [
                    {
                        uuid: 'active-rule-uuid',
                        status: 'active',
                        centralizedConfig: {
                            path: '.fossy-rules/review/style.yml',
                            status: 'synced',
                        },
                    },
                ],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'active-rule-uuid',
            });

            const result = await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(result.success).toBe(true);
            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: 'active-rule-uuid',
                    centralizedConfig: {
                        path: '.fossy-rules/review/style.yml',
                        status: 'synced',
                    },
                    status: 'active',
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should resurrect a DELETED rule when the YAML file is present again', async () => {
            // Stale cleanup can soft-delete a rule whose file is only on an
            // open PR. After that PR merges, git is source of truth: the
            // file is on the default branch, so sync must restore ACTIVE
            // instead of preserving DELETED (which hid the rule in the UI).
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/review',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'standard' as any,
                    ruleFilePath: '.fossy-rules/review/docs.yml',
                    path: '.fossy-rules/review/docs.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Docs must not contradict the change',
                rule: 'Flag contradictions, not missing docs',
                examples: [],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [
                    {
                        uuid: 'deleted-rule-uuid',
                        status: 'deleted',
                        origin: 'user',
                        centralizedConfig: {
                            path: '.fossy-rules/review/docs.yml',
                            status: 'synced',
                        },
                    },
                ],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'deleted-rule-uuid',
            });

            await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: 'deleted-rule-uuid',
                    status: 'active',
                    origin: 'user',
                    centralizedConfig: {
                        path: '.fossy-rules/review/docs.yml',
                        status: 'synced',
                    },
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should resurrect a DELETED rule as PAUSED when YAML enabled is false', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/review',
                    repositoryId: undefined,
                    directoryPath: undefined,
                    ruleType: 'standard' as any,
                    ruleFilePath: '.fossy-rules/review/paused.yml',
                    path: '.fossy-rules/review/paused.yml',
                },
            ];

            const mockRuleContent = {
                title: 'Paused after restore',
                rule: 'Stay paused',
                enabled: false,
                examples: [],
                inheritance: { inheritable: true, exclude: [], include: [] },
            };

            mockCodeManagementService.getRepositoryTree.mockResolvedValue([]);
            mockCodeManagementService.getDefaultBranch.mockResolvedValue(
                'main',
            );
            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from(
                            yaml.dump(mockRuleContent),
                        ).toString('base64'),
                        encoding: 'base64',
                    },
                },
            );

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });

            mockIntegrationConfigService.findIntegrationConfigFormatted.mockResolvedValue(
                [],
            );
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [
                    {
                        uuid: 'deleted-paused-uuid',
                        status: 'deleted',
                        centralizedConfig: {
                            path: '.fossy-rules/review/paused.yml',
                            status: 'synced',
                        },
                    },
                ],
            });
            mockCreateOrUpdateFossyRulesUseCase.execute.mockResolvedValue({
                uuid: 'deleted-paused-uuid',
            });

            await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            expect(
                mockCreateOrUpdateFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    uuid: 'deleted-paused-uuid',
                    status: 'paused',
                }),
                'org-1',
                expect.any(Object),
                true,
            );
        });

        it('should handle YAML parsing errors gracefully', async () => {
            const ruleFiles: any[] = [
                {
                    centralizedDirectoryPath: '.fossy-rules/memories',
                    ruleFilePath: '.fossy-rules/memories/invalid.yml',
                    path: '.fossy-rules/memories/invalid.yml',
                    ruleType: 'memory' as any,
                },
            ];

            mockParametersService.findByKey.mockResolvedValue({
                configValue: {
                    repository: { name: 'central-repo', id: 'central-repo-id' },
                },
            });
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                rules: [],
            });

            mockCodeManagementService.getRepositoryContentFile.mockResolvedValue(
                {
                    data: {
                        content: Buffer.from('invalid: yaml: content: ['), // Invalid YAML
                        encoding: 'base64',
                    },
                },
            );

            const result = await service.synchronizeFossyRules({
                organizationAndTeamData,
                ruleFiles,
                actor,
            });

            // #1518: a per-file failure must NOT be reported as an overall
            // success — the sync is incomplete and the caller has to know.
            expect(result.success).toBe(false);
            expect(result.message).toContain('incomplete');
            expect(result.failureDetails).toHaveLength(1);
            expect(result.failureDetails![0].file).toBe(
                '.fossy-rules/memories/invalid.yml',
            );
        });
    });

    describe('removeStaleFossyRules', () => {
        it('should remove stale centralized rules not present in centralized files', async () => {
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'pending-merge-rule-1',
                            title: 'Pending merge rule',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/pending.yml',
                                status: 'pending_delete',
                            },
                        },
                    ],
                }),
            });

            mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute.mockResolvedValue(
                true,
            );

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                // Non-empty discovery (a real file list that just doesn't
                // include pending.yml) so the #1518 empty-discovery guard does
                // not trigger — this validates genuine stale removal.
                ruleFiles: [
                    { path: '.fossy-rules/review/other.yml' } as any,
                ],
            });

            expect(result.success).toBe(true);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith('pending-merge-rule-1', actor);
        });

        it('should NOT delete rules that were never part of the centralized config', async () => {
            // Pending/rejected/manual rules have no centralizedConfig.path —
            // they aren't exported, so the stale-cleanup must leave them alone
            // instead of treating a missing path as "stale".
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        { uuid: 'pending-rule', status: 'pending' },
                        { uuid: 'rejected-rule', status: 'rejected' },
                        {
                            uuid: 'manual-rule',
                            status: 'active',
                            centralizedConfig: null,
                        },
                        {
                            uuid: 'synced-rule',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/kept.yml',
                                status: 'synced',
                            },
                        },
                    ],
                }),
            });

            mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute.mockResolvedValue(
                true,
            );

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                ruleFiles: [
                    { path: '.fossy-rules/review/kept.yml' } as any,
                ],
            });

            expect(result.success).toBe(true);
            // The synced rule is still present in the files → not deleted.
            // None of the path-less rules are deleted either.
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).not.toHaveBeenCalled();
        });

        it('should NOT delete PENDING_ADD rules whose file is only on an open PR', async () => {
            // Sync reads the default branch. A newly created rule is exported
            // to a mutation PR first, so its YAML is not in discovery yet.
            // Treating that as "stale" is what made existing rules vanish
            // from the UI when adding another rule with centralized config.
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'pending-add-rule',
                            title: 'Docs must not contradict the change',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/docs.yml',
                                status: 'pending_add',
                            },
                        },
                        {
                            uuid: 'synced-rule',
                            title: 'Keep me',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/kept.yml',
                                status: 'synced',
                            },
                        },
                    ],
                }),
            });

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                ruleFiles: [
                    { path: '.fossy-rules/review/kept.yml' } as any,
                ],
            });

            expect(result.success).toBe(true);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).not.toHaveBeenCalled();
        });

        it('should NOT delete PENDING_EDIT rules whose file is only on an open PR', async () => {
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'pending-edit-rule',
                            title: 'Renamed on the PR',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/renamed.yml',
                                status: 'pending_edit',
                            },
                        },
                    ],
                }),
            });

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                ruleFiles: [
                    { path: '.fossy-rules/review/other.yml' } as any,
                ],
            });

            expect(result.success).toBe(true);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).not.toHaveBeenCalled();
        });

        it('should still delete a truly removed synced rule while keeping PENDING_ADD', async () => {
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'pending-add-rule',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/new.yml',
                                status: 'pending_add',
                            },
                        },
                        {
                            uuid: 'removed-synced-rule',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/gone.yml',
                                status: 'synced',
                            },
                        },
                    ],
                }),
            });

            mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute.mockResolvedValue(
                true,
            );

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                ruleFiles: [
                    { path: '.fossy-rules/review/other.yml' } as any,
                ],
            });

            expect(result.success).toBe(true);
            expect(result.removedRuleCount).toBe(1);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).toHaveBeenCalledTimes(1);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).toHaveBeenCalledWith('removed-synced-rule', actor);
        });

        it('should NOT delete PENDING_ADD when discovery is empty but the tree read is proven', async () => {
            // First production incident: only the new rule existed (pending_add),
            // default-branch discovery found fossa-config.yml and zero rule
            // files, and #1518 treated that as "user deleted the last rule".
            mockFossyRulesService.findByOrganizationId.mockResolvedValue({
                toJson: () => ({
                    rules: [
                        {
                            uuid: 'pending-add-only',
                            title: 'Docs must not contradict the change',
                            status: 'active',
                            centralizedConfig: {
                                path: '.fossy-rules/review/docs.yml',
                                status: 'pending_add',
                            },
                        },
                    ],
                }),
            });

            const result = await service.removeStaleFossyRules({
                organizationAndTeamData,
                actor,
                ruleFiles: [],
                configFiles: [{ path: 'fossa-config.yml' } as any],
            });

            expect(result.success).toBe(true);
            expect(result.removedRuleCount).toBe(0);
            expect(
                mockDeleteRuleInOrganizationByIdFossyRulesUseCase.execute,
            ).not.toHaveBeenCalled();
        });
    });
});
