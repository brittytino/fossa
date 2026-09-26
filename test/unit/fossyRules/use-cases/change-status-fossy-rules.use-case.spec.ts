import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { CentralizedConfigPrService } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import { ChangeStatusFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/change-status-fossy-rules.use-case';
import { CreateOrUpdateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/create-or-update.use-case';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/delete-rule-in-organization-by-id.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-rules-in-organization-by-filter.use-case';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

jest.mock('@libs/core/log/logger', () => ({
    createLogger: () => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
}));

describe('ChangeStatusFossyRulesUseCase', () => {
    let useCase: ChangeStatusFossyRulesUseCase;

    const fossyRulesServiceMock = {
        createOrUpdate: jest.fn(),
    } as unknown as jest.Mocked<IFossyRulesService>;

    const createOrUpdateUseCaseMock = {
        execute: jest.fn(),
    };

    const deleteRuleUseCaseMock = {
        execute: jest.fn(),
    };

    const centralizedConfigPrServiceMock = {
        getCentralizedRepositoryIfEnabled: jest.fn(),
        resolveDirectoryGroupFolderName: jest.fn().mockResolvedValue(null),
        createMutationPullRequestIfEnabled: jest
            .fn()
            .mockResolvedValue({ mode: 'centralized-pr' }),
    };

    const findRulesUseCaseMock = {
        execute: jest.fn(),
    };

    const authorizationServiceMock = {
        ensure: jest.fn().mockResolvedValue(undefined),
    };

    const requestMock = {
        user: {
            uuid: 'user-1',
            email: 'dev@fossa.local',
            organization: { uuid: 'org-1' },
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChangeStatusFossyRulesUseCase,
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: fossyRulesServiceMock,
                },
                {
                    provide: CreateOrUpdateFossyRulesUseCase,
                    useValue: createOrUpdateUseCaseMock,
                },
                {
                    provide: DeleteRuleInOrganizationByIdFossyRulesUseCase,
                    useValue: deleteRuleUseCaseMock,
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: centralizedConfigPrServiceMock,
                },
                {
                    provide:
                        FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
                    useValue: findRulesUseCaseMock,
                },
                {
                    provide: AuthorizationService,
                    useValue: authorizationServiceMock,
                },
                {
                    provide: REQUEST,
                    useValue: requestMock,
                },
            ],
        }).compile();

        useCase = module.get(ChangeStatusFossyRulesUseCase);
    });

    it('throws when organization id is missing', async () => {
        requestMock.user.organization.uuid = undefined as any;

        await expect(
            useCase.execute({
                ruleIds: ['rule-1'],
                status: FossyRulesStatus.ACTIVE,
            }),
        ).rejects.toThrow('Organization ID not found');

        requestMock.user.organization.uuid = 'org-1';
    });

    it('routes ACTIVE status through centralized-aware createOrUpdate use case', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.PENDING,
            },
        ]);

        createOrUpdateUseCaseMock.execute.mockResolvedValue({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/1',
        });

        const result = await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.ACTIVE,
        });

        expect(createOrUpdateUseCaseMock.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.ACTIVE,
            }),
            'org-1',
            { userId: 'user-1', userEmail: 'dev@fossa.local' },
            true,
            undefined,
        );
        expect(fossyRulesServiceMock.createOrUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/1',
        });
    });

    it('routes PAUSED status through centralized-aware createOrUpdate use case', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.ACTIVE,
            },
        ]);

        createOrUpdateUseCaseMock.execute.mockResolvedValue({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/3',
        });

        const result = await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.PAUSED,
        });

        expect(createOrUpdateUseCaseMock.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.PAUSED,
            }),
            'org-1',
            { userId: 'user-1', userEmail: 'dev@fossa.local' },
            true,
            undefined,
        );
        // The bug being fixed: pause must NOT write straight to the DB,
        // bypassing centralized config.
        expect(fossyRulesServiceMock.createOrUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/3',
        });
    });

    it('keeps workflow statuses as DB-only updates', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.PENDING,
            },
        ]);

        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-1',
            status: FossyRulesStatus.REJECTED,
        } as any);

        const result = await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.REJECTED,
        });

        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            { organizationId: 'org-1', teamId: undefined },
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.REJECTED,
            }),
            { userId: 'user-1', userEmail: 'dev@fossa.local' },
        );
        expect(createOrUpdateUseCaseMock.execute).not.toHaveBeenCalled();
        expect(result).toEqual([
            {
                uuid: 'rule-1',
                status: FossyRulesStatus.REJECTED,
            },
        ]);
    });

    it('withdraws the centralized proposal when rejecting a pending item that has one', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.PENDING,
                centralizedConfig: { path: 'repo-1/.fossy-rules/review/x.yml' },
            },
        ]);
        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            { id: 'central-repo-id', name: 'central-repo' },
        );
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-1',
            status: FossyRulesStatus.REJECTED,
        } as any);

        await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.REJECTED,
        });

        // The proposed file is withdrawn from the rolling PR...
        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).toHaveBeenCalledTimes(1);
        // ...and the DB row is still marked REJECTED.
        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            { organizationId: 'org-1', teamId: undefined },
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.REJECTED,
            }),
            expect.any(Object),
        );
    });

    it('does not touch the centralized PR when rejecting an item without a proposal', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.PENDING,
            },
        ]);
        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            { id: 'central-repo-id', name: 'central-repo' },
        );
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-1',
            status: FossyRulesStatus.REJECTED,
        } as any);

        await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.REJECTED,
        });

        expect(
            centralizedConfigPrServiceMock.createMutationPullRequestIfEnabled,
        ).not.toHaveBeenCalled();
    });

    it('routes DELETED status through centralized delete flow when centralized config is enabled', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.ACTIVE,
            },
        ]);

        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            {
                id: 'central-repo-id',
                name: 'central-repo',
            },
        );
        deleteRuleUseCaseMock.execute.mockResolvedValue({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/2',
        });

        const result = await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.DELETED,
        });

        expect(deleteRuleUseCaseMock.execute).toHaveBeenCalledWith('rule-1', {
            source: 'web',
            organizationId: 'org-1',
            teamId: undefined,
            userId: 'user-1',
            userEmail: 'dev@fossa.local',
        });
        expect(fossyRulesServiceMock.createOrUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
            mode: 'centralized-pr',
            prUrl: 'https://example.com/pr/2',
        });
    });

    it('keeps DELETED as logical DB update when centralized config is disabled', async () => {
        findRulesUseCaseMock.execute.mockResolvedValue([
            {
                uuid: 'rule-1',
                repositoryId: 'repo-1',
                title: 'Rule 1',
                rule: 'Do X',
                status: FossyRulesStatus.ACTIVE,
            },
        ]);

        centralizedConfigPrServiceMock.getCentralizedRepositoryIfEnabled.mockResolvedValue(
            null,
        );
        fossyRulesServiceMock.createOrUpdate.mockResolvedValue({
            uuid: 'rule-1',
            status: FossyRulesStatus.DELETED,
        } as any);

        const result = await useCase.execute({
            ruleIds: ['rule-1'],
            status: FossyRulesStatus.DELETED,
        });

        expect(fossyRulesServiceMock.createOrUpdate).toHaveBeenCalledWith(
            { organizationId: 'org-1', teamId: undefined },
            expect.objectContaining({
                uuid: 'rule-1',
                status: FossyRulesStatus.DELETED,
            }),
            { userId: 'user-1', userEmail: 'dev@fossa.local' },
        );
        expect(deleteRuleUseCaseMock.execute).not.toHaveBeenCalled();
        expect(result).toEqual([
            {
                uuid: 'rule-1',
                status: FossyRulesStatus.DELETED,
            },
        ]);
    });
});
