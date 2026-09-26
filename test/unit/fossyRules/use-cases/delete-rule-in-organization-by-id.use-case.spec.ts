import { ForbiddenException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import {
    CentralizedConfigPrService,
    CentralizedPrMetadata,
} from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { PERMISSIONS_SERVICE_TOKEN } from '@libs/identity/domain/permissions/contracts/permissions.service.contract';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import { PermissionsAbilityFactory } from '@libs/identity/infrastructure/adapters/services/permissions/permissionsAbility.factory';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/delete-rule-in-organization-by-id.use-case';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import {
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

describe('DeleteRuleInOrganizationByIdFossyRulesUseCase', () => {
    let useCase: DeleteRuleInOrganizationByIdFossyRulesUseCase;
    let fossyRulesServiceMock: jest.Mocked<IFossyRulesService>;
    let centralizedConfigPrServiceMock: {
        createMutationPullRequestIfEnabled: jest.Mock;
        resolveRepositoryFolderName: jest.Mock;
        resolveDirectoryGroupFolderName: jest.Mock;
        buildCentralizedPath: jest.Mock;
        sanitizeFileName: jest.Mock;
        buildRuleFileName: jest.Mock;
    };

    beforeEach(async () => {
        fossyRulesServiceMock = {
            findById: jest.fn(),
            createOrUpdate: jest.fn(),
            deleteRuleWithLogging: jest.fn(),
        } as unknown as jest.Mocked<IFossyRulesService>;

        centralizedConfigPrServiceMock = {
            createMutationPullRequestIfEnabled: jest.fn(),
            resolveRepositoryFolderName: jest.fn().mockResolvedValue('global'),
            resolveDirectoryGroupFolderName: jest.fn().mockResolvedValue(null),
            buildCentralizedPath: jest
                .fn()
                .mockImplementation(({ repositoryFolder, relativePath }) =>
                    repositoryFolder === 'global'
                        ? relativePath
                        : `${repositoryFolder}/${relativePath}`,
                ),
            sanitizeFileName: jest.fn().mockReturnValue('no-console-logs'),
            buildRuleFileName: jest.fn(
                (_t?: string, u?: string) =>
                    `no-console-logs${u ? `-${String(u).slice(0, 8)}` : ''}.yml`,
            ),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteRuleInOrganizationByIdFossyRulesUseCase,
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: fossyRulesServiceMock,
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: centralizedConfigPrServiceMock,
                },
                {
                    provide: AuthorizationService,
                    useValue: { ensure: jest.fn().mockResolvedValue(undefined) },
                },
                {
                    provide: REQUEST,
                    useValue: {
                        user: {
                            organization: { uuid: 'org-1' },
                            uuid: 'user-1',
                            email: 'dev@fossa.local',
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get(DeleteRuleInOrganizationByIdFossyRulesUseCase);
    });

    it('routes delete through centralized PR when actor provides teamId', async () => {
        fossyRulesServiceMock.findById.mockResolvedValue({
            uuid: 'rule-1',
            title: 'No console logs',
            type: FossyRulesType.STANDARD,
            repositoryId: 'global',
            status: FossyRulesStatus.ACTIVE,
        } as any);

        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            {
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/99',
            } as CentralizedPrMetadata,
        );

        const result = await useCase.execute('rule-1', {
            source: 'web',
            organizationId: 'org-1',
            teamId: 'team-1',
            userId: 'user-1',
            userEmail: 'dev@fossa.local',
        });

        expect(result).toEqual(
            expect.objectContaining({
                mode: 'centralized-pr',
                prUrl: 'https://example.com/pr/99',
            }),
        );

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                organizationAndTeamData: {
                    organizationId: 'org-1',
                    teamId: 'team-1',
                },
                repositoryId: 'global',
            }),
        );

        expect(
            fossyRulesServiceMock.deleteRuleWithLogging,
        ).not.toHaveBeenCalled();
        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalled();
    });

    it('falls back to direct delete for sync actor', async () => {
        fossyRulesServiceMock.findById.mockResolvedValue({
            uuid: 'rule-1',
            type: FossyRulesType.STANDARD,
            repositoryId: 'repo-1',
        } as any);
        fossyRulesServiceMock.deleteRuleWithLogging.mockResolvedValue(true);

        const result = await useCase.execute('rule-1', {
            source: 'sync',
            organizationId: 'org-1',
            userId: 'fossy',
            userEmail: 'fossy@fossa.local',
        });

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).not.toHaveBeenCalled();
        expect(fossyRulesServiceMock.deleteRuleWithLogging).toHaveBeenCalledWith(
            {
                organizationId: 'org-1',
            },
            'rule-1',
            {
                userId: 'fossy',
                userEmail: 'fossy@fossa.local',
            },
        );
        expect(result).toBe(true);
    });
});

/**
 * Repo-scope enforcement. The controller guard (`checkPermissions`) is
 * type-level only — it cannot know which repository the rule belongs to —
 * so the use case must enforce it, the same contract
 * `ChangeStatusFossyRulesUseCase` already honors via
 * `authorizationService.ensure`. These tests wire the REAL
 * AuthorizationService + PermissionsAbilityFactory (only the permissions
 * repository is mocked) so they prove the actual policy outcome.
 */
describe('DeleteRuleInOrganizationByIdFossyRulesUseCase — repo scope', () => {
    const fossyRulesServiceMock = {
        findById: jest.fn(),
        createOrUpdate: jest.fn(),
        deleteRuleWithLogging: jest.fn(),
    } as unknown as jest.Mocked<IFossyRulesService>;

    const centralizedConfigPrServiceMock = {
        createMutationPullRequestIfEnabled: jest.fn(),
        resolveDirectoryGroupFolderName: jest.fn().mockResolvedValue(null),
    };

    // repo_admin assigned ONLY to repo-a.
    const permissionsServiceMock = {
        findOne: jest.fn(),
    };

    const repoAdminUser = {
        uuid: 'user-1',
        email: 'dev@fossa.local',
        role: Role.REPO_ADMIN,
        status: STATUS.ACTIVE,
        organization: { uuid: 'org-1' },
    };

    const ownerUser = {
        ...repoAdminUser,
        role: Role.OWNER,
    };

    const buildUseCase = async (user: Record<string, unknown> | null) => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteRuleInOrganizationByIdFossyRulesUseCase,
                AuthorizationService,
                PermissionsAbilityFactory,
                {
                    provide: PERMISSIONS_SERVICE_TOKEN,
                    useValue: permissionsServiceMock,
                },
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: fossyRulesServiceMock,
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: centralizedConfigPrServiceMock,
                },
            ],
        }).compile();

        const useCase = module.get(
            DeleteRuleInOrganizationByIdFossyRulesUseCase,
        );

        // Use-cases no longer inject REQUEST — the controller forwards the
        // authenticated user. Wrap execute() to pass the test user through.
        return {
            execute: (ruleId: string, actor?: any) =>
                useCase.execute(ruleId, actor, (user ?? undefined) as any),
        };
    };

    const ruleIn = (repositoryId: string) => ({
        uuid: 'rule-1',
        title: 'Some rule',
        rule: 'Do X',
        type: FossyRulesType.STANDARD,
        repositoryId,
        status: FossyRulesStatus.ACTIVE,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        permissionsServiceMock.findOne.mockResolvedValue({
            permissions: { assignedRepositoryIds: ['repo-a'] },
        });
        centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled.mockResolvedValue(
            { mode: 'direct' },
        );
        fossyRulesServiceMock.deleteRuleWithLogging.mockResolvedValue(true);
    });

    it('denies a repo admin deleting a rule from a repository they are not assigned to', async () => {
        const useCase = await buildUseCase(repoAdminUser);
        fossyRulesServiceMock.findById.mockResolvedValue(
            ruleIn('repo-b') as any,
        );

        await expect(
            useCase.execute('rule-1', { source: 'web' }),
        ).rejects.toThrow(ForbiddenException);

        expect(
            fossyRulesServiceMock.deleteRuleWithLogging,
        ).not.toHaveBeenCalled();
        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).not.toHaveBeenCalled();
    });

    it('denies a repo admin deleting a global rule', async () => {
        const useCase = await buildUseCase(repoAdminUser);
        fossyRulesServiceMock.findById.mockResolvedValue(
            ruleIn('global') as any,
        );

        await expect(
            useCase.execute('rule-1', { source: 'web' }),
        ).rejects.toThrow(ForbiddenException);

        expect(
            fossyRulesServiceMock.deleteRuleWithLogging,
        ).not.toHaveBeenCalled();
    });

    it('allows a repo admin to delete a rule in an assigned repository', async () => {
        const useCase = await buildUseCase(repoAdminUser);
        fossyRulesServiceMock.findById.mockResolvedValue(
            ruleIn('repo-a') as any,
        );

        await expect(
            useCase.execute('rule-1', { source: 'web' }),
        ).resolves.toBe(true);

        expect(fossyRulesServiceMock.deleteRuleWithLogging).toHaveBeenCalledWith(
            { organizationId: 'org-1' },
            'rule-1',
            { userId: 'user-1', userEmail: 'dev@fossa.local' },
        );
    });

    it('allows the owner to delete a rule in any repository', async () => {
        const useCase = await buildUseCase(ownerUser);
        fossyRulesServiceMock.findById.mockResolvedValue(
            ruleIn('repo-b') as any,
        );

        await expect(
            useCase.execute('rule-1', { source: 'web' }),
        ).resolves.toBe(true);

        expect(fossyRulesServiceMock.deleteRuleWithLogging).toHaveBeenCalled();
    });

    it('keeps machine sync deletions working without a request context', async () => {
        const useCase = await buildUseCase(null);
        fossyRulesServiceMock.findById.mockResolvedValue(
            ruleIn('repo-b') as any,
        );

        await expect(
            useCase.execute('rule-1', {
                source: 'sync',
                organizationId: 'org-1',
                teamId: 'team-1',
                userId: 'fossy-system',
                userEmail: 'fossy@fossa.local',
            }),
        ).resolves.toBe(true);

        expect(fossyRulesServiceMock.deleteRuleWithLogging).toHaveBeenCalled();
    });
});
