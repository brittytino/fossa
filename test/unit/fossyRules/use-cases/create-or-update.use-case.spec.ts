import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { ContextReferenceDetectionService } from '@libs/ai-engine/infrastructure/adapters/services/context/context-reference-detection.service';
import {
    CONTEXT_RESOLUTION_SERVICE_TOKEN,
    IContextResolutionService,
} from '@libs/core/context-resolution/domain/contracts/context-resolution.service.contract';
import {
    CentralizedConfigPrService,
    CentralizedPrMetadata,
} from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { PermissionValidationService } from '@libs/shared/infrastructure/permissions';
import { FOSSY_RULE_DETECTOR_COMPILER_TOKEN } from '@libs/fossyRules/domain/contracts/fossy-rule-detector-compiler.contract';
import { CreateOrUpdateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/create-or-update.use-case';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import {
    FossyRuleCentralizedStatus,
    FossyRulesOrigin,
    FossyRulesScope,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

jest.mock('@libs/core/log/logger', () => ({
    createLogger: () => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
}));

describe('CreateOrUpdateFossyRulesUseCase (centralized pending states)', () => {
    let useCase: CreateOrUpdateFossyRulesUseCase;
    let fossyRulesServiceMock: jest.Mocked<IFossyRulesService>;
    let centralizedConfigPrServiceMock: {
        createMutationPullRequestIfEnabled: jest.Mock;
        getCentralizedRepositoryIfEnabled: jest.Mock;
        resolveRepositoryFolderName: jest.Mock;
        resolveDirectoryGroupFolderName: jest.Mock;
        buildCentralizedPath: jest.Mock;
        sanitizeFileName: jest.Mock;
        buildRuleFileName: jest.Mock;
    };

    beforeEach(async () => {
        fossyRulesServiceMock = {
            createOrUpdate: jest.fn(),
            findById: jest.fn(),
            updateRuleReferences: jest.fn(),
        } as unknown as jest.Mocked<IFossyRulesService>;

        centralizedConfigPrServiceMock = {
            createMutationPullRequestIfEnabled: jest.fn(),
            getCentralizedRepositoryIfEnabled: jest.fn(),
            resolveRepositoryFolderName: jest.fn(),
            resolveDirectoryGroupFolderName: jest
                .fn()
                .mockResolvedValue(null),
            buildCentralizedPath: jest.fn(),
            sanitizeFileName: jest.fn(),
            buildRuleFileName: jest.fn(
                (title?: string, uuid?: string) =>
                    `${centralizedConfigPrServiceMock.sanitizeFileName(
                        title,
                        'rule',
                    )}${uuid ? `-${String(uuid).slice(0, 8)}` : ''}.yml`,
            ),
        };

        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            null,
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrUpdateFossyRulesUseCase,
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: fossyRulesServiceMock,
                },
                {
                    provide: CONTEXT_RESOLUTION_SERVICE_TOKEN,
                    useValue: {
                        getTeamIdByOrganizationAndRepository: jest.fn(),
                        getRepositoryNameByOrganizationAndRepository: jest.fn(),
                    } as Partial<IContextResolutionService>,
                },
                {
                    provide: AuthorizationService,
                    useValue: {
                        ensure: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: ContextReferenceDetectionService,
                    useValue: {
                        detectAndSaveReferences: jest.fn(),
                    },
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: centralizedConfigPrServiceMock,
                },
                {
                    provide: PermissionValidationService,
                    useValue: {
                        getBYOKConfig: jest.fn().mockResolvedValue(null),
                        getSubscriptionStatus: jest
                            .fn()
                            .mockResolvedValue(undefined),
                    },
                },
                {
                    provide: FOSSY_RULE_DETECTOR_COMPILER_TOKEN,
                    useValue: {
                        compileAndSave: jest
                            .fn()
                            .mockResolvedValue(undefined),
                    },
                },
                {
                    provide: REQUEST,
                    useValue: {
                        user: {
                            organization: { uuid: 'org-1' },
                            team: { uuid: 'team-1' },
                            uuid: 'user-1',
                            email: 'dev@fossa.local',
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get(CreateOrUpdateFossyRulesUseCase);
    });

    it('persists create flow as pending_add when centralized PR mode is active', async () => {
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/10',
            } as CentralizedPrMetadata,
        );
        centralizedConfigPrServiceMock.resolveRepositoryFolderName.mockResolvedValue(
            'repo-one',
        );
        centralizedConfigPrServiceMock.sanitizeFileName.mockReturnValue(
            'avoid-debug',
        );
        centralizedConfigPrServiceMock.buildCentralizedPath.mockImplementation(
            ({ repositoryFolder, relativePath }) =>
                `${repositoryFolder}/${relativePath}`,
        );

        fossyRulesServiceMock.findById.mockResolvedValue(null);
        const result = await useCase.execute(
            {
                type: FossyRulesType.STANDARD,
                title: 'Avoid debug logs',
                rule: 'Do not commit debug logs',
                severity: 'medium' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.MANUAL,
                repositoryId: 'repo-1',
                examples: [],
            },
            'org-1',
        );

        expect(result).toEqual(
            expect.objectContaining({ mode: 'centralized-pr' }),
        );
        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                title: 'Avoid debug logs',
                repositoryId: 'repo-1',
                status: FossyRulesStatus.ACTIVE,
                centralizedConfig: {
                    path: 'repo-one/.fossy-rules/review/avoid-debug.yml',
                    status: FossyRuleCentralizedStatus.PENDING_ADD,
                },
            }),
            expect.anything(),
        );
    });

    it('keeps existing centralized source path when updating a centralized-pending rule', async () => {
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/10',
            } as CentralizedPrMetadata,
        );
        centralizedConfigPrServiceMock.resolveRepositoryFolderName.mockResolvedValue(
            'repo-one',
        );

        fossyRulesServiceMock.findById.mockResolvedValue({
            uuid: 'rule-1',
            type: FossyRulesType.STANDARD,
            title: 'Avoid debug logs',
            rule: 'Do not commit debug logs',
            severity: 'medium',
            scope: FossyRulesScope.FILE,
            path: '**/*',
            origin: FossyRulesOrigin.MANUAL,
            repositoryId: 'repo-1',
            status: FossyRulesStatus.ACTIVE,
            centralizedConfig: {
                path: 'repo-one/.fossy-rules/review/existing.yml',
                status: FossyRuleCentralizedStatus.PENDING_EDIT,
            },
        } as any);
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-1',
        } as any);

        await useCase.execute(
            {
                uuid: 'rule-1',
                type: FossyRulesType.STANDARD,
                title: 'Avoid debug logs v2',
                rule: 'Do not commit verbose debug logs',
                severity: 'medium' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.MANUAL,
                repositoryId: 'repo-1',
                examples: [],
            },
            'org-1',
        );

        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.ACTIVE,
                centralizedConfig: {
                    path: 'repo-one/.fossy-rules/review/existing.yml',
                    status: FossyRuleCentralizedStatus.PENDING_EDIT,
                },
            }),
            expect.anything(),
        );
    });

    it('uses explicit teamId for global rule centralized mutation and writes pending_add snapshot', async () => {
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/11',
            } as CentralizedPrMetadata,
        );
        centralizedConfigPrServiceMock.resolveRepositoryFolderName.mockResolvedValue(
            'global',
        );
        centralizedConfigPrServiceMock.sanitizeFileName.mockReturnValue(
            'no-hardcoded-secrets',
        );
        centralizedConfigPrServiceMock.buildCentralizedPath.mockImplementation(
            ({ repositoryFolder, relativePath }) =>
                `${repositoryFolder}/${relativePath}`,
        );

        (useCase as any).request = {
            user: {
                organization: { uuid: 'org-1' },
                uuid: 'user-1',
                email: 'dev@fossa.local',
            },
        };

        fossyRulesServiceMock.findById.mockResolvedValue(null);

        await useCase.execute(
            {
                type: FossyRulesType.STANDARD,
                title: 'No hardcoded secrets',
                rule: 'Avoid hardcoded credentials in source code',
                severity: 'high' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.MANUAL,
                repositoryId: 'global',
                examples: [],
            },
            'org-1',
            undefined,
            undefined,
            'team-explicit',
        );

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                organizationAndTeamData: {
                    organizationId: 'org-1',
                    teamId: 'team-explicit',
                },
                repositoryId: 'global',
            }),
        );

        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                organizationId: 'org-1',
                teamId: 'team-explicit',
            }),
            expect.objectContaining({
                repositoryId: 'global',
                status: FossyRulesStatus.ACTIVE,
                centralizedConfig: {
                    path: 'global/.fossy-rules/review/no-hardcoded-secrets.yml',
                    status: FossyRuleCentralizedStatus.PENDING_ADD,
                },
            }),
            expect.anything(),
        );
    });

    it('updates existing file path when legacy rule has no centralizedConfig path', async () => {
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/12',
            } as CentralizedPrMetadata,
        );
        centralizedConfigPrServiceMock.resolveRepositoryFolderName.mockResolvedValue(
            'repo-one',
        );
        centralizedConfigPrServiceMock.sanitizeFileName
            .mockReturnValueOnce('legacy-title')
            .mockReturnValueOnce('legacy-title');
        centralizedConfigPrServiceMock.buildCentralizedPath.mockImplementation(
            ({ repositoryFolder, relativePath }) =>
                `${repositoryFolder}/${relativePath}`,
        );

        fossyRulesServiceMock.findById.mockResolvedValue({
            uuid: 'rule-legacy-1',
            type: FossyRulesType.STANDARD,
            title: 'Legacy Title',
            rule: 'Original rule content',
            severity: 'medium',
            scope: FossyRulesScope.FILE,
            path: '**/*',
            origin: FossyRulesOrigin.MANUAL,
            repositoryId: 'repo-1',
            status: FossyRulesStatus.ACTIVE,
            centralizedConfig: undefined,
        } as any);
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-legacy-1',
        } as any);

        await useCase.execute(
            {
                uuid: 'rule-legacy-1',
                type: FossyRulesType.STANDARD,
                title: 'New Title',
                rule: 'Updated rule content',
                severity: 'medium' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.MANUAL,
                repositoryId: 'repo-1',
                examples: [],
            },
            'org-1',
        );

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                repositoryId: 'repo-1',
                files: expect.any(Function),
            }),
        );

        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                uuid: 'rule-legacy-1',
                status: FossyRulesStatus.ACTIVE,
                centralizedConfig: {
                    path: 'repo-one/.fossy-rules/review/legacy-title-rule-leg.yml',
                    status: FossyRuleCentralizedStatus.PENDING_EDIT,
                },
            }),
            expect.anything(),
        );
    });

    it('bypasses centralized PR routing for internal sync actor', async () => {
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'synced-rule-1',
        } as any);

        const result = await useCase.execute(
            {
                type: FossyRulesType.STANDARD,
                title: 'Synced from centralized',
                rule: 'Always prefer safe defaults',
                severity: 'medium' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.MANUAL,
                repositoryId: 'repo-1',
                examples: [],
            },
            'org-1',
            {
                userId: 'fossy',
                userEmail: 'fossy@fossa.local',
            },
            true,
        );

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).not.toHaveBeenCalled();
        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalled();
        expect(result).toEqual(
            expect.objectContaining({ uuid: 'synced-rule-1' }),
        );
    });

    it('throws and avoids direct DB write when centralized is enabled but PR routing returns direct', async () => {
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'direct',
            },
        );
        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            {
                id: 'central-repo-id',
                name: 'central-repo',
            },
        );

        fossyRulesServiceMock.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(
                {
                    type: FossyRulesType.STANDARD,
                    title: 'Avoid debug logs',
                    rule: 'Do not commit debug logs',
                    severity: 'medium' as any,
                    scope: FossyRulesScope.FILE,
                    path: '**/*',
                    origin: FossyRulesOrigin.MANUAL,
                    repositoryId: 'repo-1',
                    examples: [],
                },
                'org-1',
            ),
        ).rejects.toThrow(
            'Centralized config is enabled, but rule mutation was not routed through centralized PR flow',
        );

        expect(fossyRulesServiceMock.createOrUpdate).not.toHaveBeenCalled();
    });

    it('does NOT route a PENDING rule through centralized config — persists directly, no throw', async () => {
        // Centralized config is the source of truth for approved rules only.
        // A rule awaiting approval (e.g. a gated IDE-synced rule) must be
        // written to the DB as pending, not exported to the rolling PR.
        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            { id: 'central-repo-id', name: 'central-repo' },
        );
        fossyRulesServiceMock.findById.mockResolvedValue(null);
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'pending-rule-1',
        } as any);

        const result = await useCase.execute(
            {
                type: FossyRulesType.STANDARD,
                title: 'Auto-synced rule',
                rule: 'From a repo file',
                severity: 'medium' as any,
                scope: FossyRulesScope.FILE,
                path: '**/*',
                origin: FossyRulesOrigin.REPO_FILE_SYNC,
                repositoryId: 'repo-1',
                examples: [],
                status: FossyRulesStatus.PENDING,
            },
            'org-1',
        );

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).not.toHaveBeenCalled();
        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalled();
        expect(result).toEqual(
            expect.objectContaining({ uuid: 'pending-rule-1' }),
        );
    });
});
