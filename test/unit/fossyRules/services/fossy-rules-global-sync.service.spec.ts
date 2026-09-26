import { FossyRulesSyncService } from '@libs/fossyRules/infrastructure/adapters/services/fossyRulesSync.service';
import {
    FossyRulesOrigin,
    FossyRulesStatus,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

jest.mock('@libs/core/log/logger', () => ({
    createLogger: () => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
}));

const organizationAndTeamData = {
    organizationId: 'org-1',
    teamId: 'team-1',
};

/**
 * Builds a FossyRulesSyncService with just the collaborators the global-sync
 * paths touch. `rules` is the org's current rule pool as returned by
 * `findByOrganizationId`; `allFiles` is the source repo's tree at HEAD.
 */
function createService(opts: {
    rules?: any[];
    allFiles?: Array<{ path: string; sha?: string }>;
    fileContent?: string;
    tier?: 'free' | 'trial' | 'paid';
}) {
    const rules = opts.rules ?? [];
    const allFiles = opts.allFiles ?? [];
    const fileContent = opts.fileContent ?? 'A global architecture rule.';
    const tier = opts.tier ?? 'paid';

    const fossyRulesService = {
        findByOrganizationId: jest
            .fn()
            .mockResolvedValue({ rules }),
        createOrUpdate: jest.fn().mockResolvedValue({ uuid: 'new-rule' }),
    };
    const permissionValidationService = {
        resolveGlobalRulesImportTier: jest.fn().mockResolvedValue(tier),
    };
    const codeManagementService = {
        getDefaultBranch: jest.fn().mockResolvedValue('main'),
        getRepositoryAllFiles: jest.fn().mockResolvedValue(allFiles),
        getRepositoryContentFile: jest.fn().mockResolvedValue({
            data: {
                content: Buffer.from(fileContent, 'utf-8').toString('base64'),
                encoding: 'base64',
            },
        }),
    };
    const deleteRuleInOrganizationByIdFossyRulesUseCase = {
        execute: jest.fn().mockResolvedValue(undefined),
    };

    const service = new FossyRulesSyncService(
        fossyRulesService as any,
        {} as any, // parametersService
        {} as any, // contextResolutionService
        codeManagementService as any,
        {} as any, // updateOrCreateCodeReviewParameterUseCase
        {} as any, // createOrUpdateFossyRulesUseCase
        deleteRuleInOrganizationByIdFossyRulesUseCase as any,
        permissionValidationService as any,
        {} as any, // observabilityService
        {} as any, // contextReferenceDetectionService
    );

    jest.spyOn(service as any, 'convertFileToFossyRules').mockResolvedValue([
        {
            title: 'Global Rule',
            rule: fileContent,
            path: '**/*',
            severity: 'medium',
            scope: 'file',
            examples: [],
        },
    ]);

    return {
        service,
        fossyRulesService,
        codeManagementService,
        deleteRuleInOrganizationByIdFossyRulesUseCase,
        permissionValidationService,
    };
}

const globalSyncedRule = (over: Partial<any>) => ({
    uuid: 'u-global-a',
    repositoryId: 'global',
    origin: FossyRulesOrigin.GLOBAL_REPO_FILE_SYNC,
    sourceRepositoryId: 'repo-A',
    sourcePath: 'CLAUDE.md',
    status: FossyRulesStatus.ACTIVE,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
});

describe('FossyRulesSyncService.purgeGlobalRulesForSourceRepository', () => {
    it('soft-deletes only this source repo\'s global-synced rules, never user or other-source rules', async () => {
        const rules = [
            globalSyncedRule({ uuid: 'a1', sourceRepositoryId: 'repo-A' }),
            globalSyncedRule({ uuid: 'a2', sourceRepositoryId: 'repo-A', sourcePath: 'docs/AGENTS.md' }),
            // other source repo — must be left alone
            globalSyncedRule({ uuid: 'b1', sourceRepositoryId: 'repo-B' }),
            // user-authored global rule — must be left alone
            {
                uuid: 'g-user',
                repositoryId: 'global',
                origin: FossyRulesOrigin.MANUAL,
                status: FossyRulesStatus.ACTIVE,
            },
            // already deleted from repo-A — must be skipped
            globalSyncedRule({ uuid: 'a-del', sourceRepositoryId: 'repo-A', status: FossyRulesStatus.DELETED }),
            // repo-scoped rule — must be left alone
            {
                uuid: 'r-scoped',
                repositoryId: 'repo-A',
                origin: FossyRulesOrigin.REPO_FILE_SYNC,
                status: FossyRulesStatus.ACTIVE,
            },
        ];
        const { service, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({ rules });

        const removed = await service.purgeGlobalRulesForSourceRepository({
            organizationAndTeamData,
            sourceRepositoryId: 'repo-A',
        });

        expect(removed).toBe(2);
        const deletedUuids =
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute.mock.calls.map(
                (c: any[]) => c[0],
            );
        expect(deletedUuids.sort()).toEqual(['a1', 'a2']);
    });

    it('returns 0 and deletes nothing when the source repo has no global rules', async () => {
        const { service, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({
                rules: [globalSyncedRule({ sourceRepositoryId: 'repo-B' })],
            });

        const removed = await service.purgeGlobalRulesForSourceRepository({
            organizationAndTeamData,
            sourceRepositoryId: 'repo-A',
        });

        expect(removed).toBe(0);
        expect(
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute,
        ).not.toHaveBeenCalled();
    });
});

describe('FossyRulesSyncService.syncRepositoryGlobal', () => {
    const repository = { id: 'repo-A', name: 'standards', fullName: 'org/standards' };

    it('short-circuits an unchanged file (same SHA) — no re-convert, no delete', async () => {
        const rules = [
            globalSyncedRule({
                uuid: 'a1',
                sourcePath: 'CLAUDE.md',
                lastContentHash: 'sha1',
            }),
        ];
        const { service, fossyRulesService, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({
                rules,
                allFiles: [{ path: 'CLAUDE.md', sha: 'sha1' }],
            });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).not.toHaveBeenCalled();
        expect(
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute,
        ).not.toHaveBeenCalled();
    });

    it('re-imports a changed file (different SHA) tagged with source repo + new hash', async () => {
        const rules = [
            globalSyncedRule({
                uuid: 'a1',
                sourcePath: 'CLAUDE.md',
                lastContentHash: 'sha1',
            }),
        ];
        const { service, fossyRulesService } = createService({
            rules,
            allFiles: [{ path: 'CLAUDE.md', sha: 'sha2' }],
        });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).toHaveBeenCalledTimes(1);
        const dto = fossyRulesService.createOrUpdate.mock.calls[0][1];
        expect(dto).toMatchObject({
            uuid: 'a1',
            repositoryId: 'global',
            sourceRepositoryId: 'repo-A',
            lastContentHash: 'sha2',
            origin: FossyRulesOrigin.GLOBAL_REPO_FILE_SYNC,
            sourcePath: 'CLAUDE.md',
        });
    });

    it('reconciles deletions: soft-deletes a global rule whose source file is gone at HEAD', async () => {
        const rules = [
            globalSyncedRule({ uuid: 'gone', sourcePath: 'REMOVED.md' }),
        ];
        const { service, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({
                rules,
                allFiles: [], // file no longer exists
            });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute,
        ).toHaveBeenCalledWith('gone', expect.any(Object));
    });

    it('does not touch another source repo\'s rules during reconciliation', async () => {
        const rules = [
            // belongs to repo-B; syncing repo-A must never delete it even though
            // its file isn't in repo-A's tree.
            globalSyncedRule({
                uuid: 'b1',
                sourceRepositoryId: 'repo-B',
                sourcePath: 'OTHER.md',
            }),
        ];
        const { service, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({ rules, allFiles: [] });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute,
        ).not.toHaveBeenCalled();
    });

    it('reactivates a previously REJECTED rule when the changed content is re-imported', async () => {
        const rules = [
            globalSyncedRule({
                uuid: 'a1',
                sourcePath: 'CLAUDE.md',
                lastContentHash: 'sha1',
                status: FossyRulesStatus.REJECTED,
            }),
        ];
        const { service, fossyRulesService } = createService({
            rules,
            allFiles: [{ path: 'CLAUDE.md', sha: 'sha2' }],
        });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        const dto = fossyRulesService.createOrUpdate.mock.calls[0][1];
        expect(dto.status).toBe(FossyRulesStatus.ACTIVE);
    });
});

describe('FossyRulesSyncService.syncRepositoryGlobal — plan gating', () => {
    const repository = {
        id: 'repo-A',
        name: 'standards',
        fullName: 'org/standards',
    };

    const files = (n: number) =>
        Array.from({ length: n }, (_, i) => ({ path: `rules/r${i}.md` }));

    it('free plan imports nothing (feature blocked)', async () => {
        const { service, fossyRulesService, deleteRuleInOrganizationByIdFossyRulesUseCase } =
            createService({ tier: 'free', allFiles: files(3) });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).not.toHaveBeenCalled();
        expect(
            deleteRuleInOrganizationByIdFossyRulesUseCase.execute,
        ).not.toHaveBeenCalled();
    });

    it('trial plan imports only the first 5 rules found and skips the rest', async () => {
        const { service, fossyRulesService } = createService({
            tier: 'trial',
            rules: [], // nothing imported yet → full budget of 5
            allFiles: files(7),
        });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).toHaveBeenCalledTimes(5);
    });

    it('trial plan imports nothing more once the 5-rule cap is already used (across repos)', async () => {
        // Five rules already imported from ANOTHER source repo — they count
        // toward the org-wide cap but must not be reconciled when syncing repo-A.
        const rules = Array.from({ length: 5 }, (_, i) =>
            globalSyncedRule({
                uuid: `b${i}`,
                sourceRepositoryId: 'repo-B',
                sourcePath: `other/r${i}.md`,
            }),
        );
        const { service, fossyRulesService } = createService({
            tier: 'trial',
            rules,
            allFiles: files(2), // two new files in repo-A
        });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).not.toHaveBeenCalled();
    });

    it('paid plan imports every rule found (no cap)', async () => {
        const { service, fossyRulesService } = createService({
            tier: 'paid',
            rules: [],
            allFiles: files(7),
        });

        await service.syncRepositoryGlobal({
            organizationAndTeamData,
            repository,
        });

        expect(fossyRulesService.createOrUpdate).toHaveBeenCalledTimes(7);
    });
});
