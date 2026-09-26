import { FossyRulesOrigin } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { GenerateInitialFossyRulesUseCase } from './generate-initial-fossy-rules.use-case';

function build(opts: { documents?: unknown[]; lockAcquired?: boolean } = {}) {
    const fossyRulesService = {
        find: jest.fn().mockResolvedValue(opts.documents ?? []),
    } as any;
    const generate = {
        execute: jest.fn().mockResolvedValue(undefined),
    } as any;
    const lock = { release: jest.fn().mockResolvedValue(undefined) };
    const distributedLockService = {
        acquire: jest
            .fn()
            .mockResolvedValue(opts.lockAcquired === false ? null : lock),
    } as any;

    return {
        useCase: new GenerateInitialFossyRulesUseCase(
            fossyRulesService,
            generate,
            distributedLockService,
        ),
        fossyRulesService,
        generate,
        distributedLockService,
        lock,
    };
}

const org = { organizationId: 'org-1', teamId: 'team-1' };

describe('GenerateInitialFossyRulesUseCase', () => {
    it('seeds the repo from the last 3 months when it has no past-review rules', async () => {
        const { useCase, generate } = build({ documents: [] });

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(generate.execute).toHaveBeenCalledTimes(1);
        expect(generate.execute).toHaveBeenCalledWith(
            { teamId: 'team-1', months: 3, repositoriesIds: ['repo-1'] },
            'org-1',
        );
    });

    it('skips generation when the repo already has past-review rules', async () => {
        const { useCase, generate } = build({
            documents: [
                {
                    rules: [
                        {
                            repositoryId: 'repo-1',
                            origin: FossyRulesOrigin.PAST_REVIEWS,
                        },
                    ],
                },
            ],
        });

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(generate.execute).not.toHaveBeenCalled();
    });

    it('still seeds when existing rules come from other origins (e.g. IDE files)', async () => {
        const { useCase, generate } = build({
            documents: [
                {
                    rules: [
                        {
                            repositoryId: 'repo-1',
                            origin: FossyRulesOrigin.REPO_FILE_SYNC,
                        },
                    ],
                },
            ],
        });

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(generate.execute).toHaveBeenCalledTimes(1);
    });

    it('no-ops without touching dependencies when required ids are missing', async () => {
        const { useCase, fossyRulesService, generate } = build();

        await useCase.execute({
            organizationAndTeamData: { organizationId: '', teamId: '' },
            repositoryId: '',
        });

        expect(fossyRulesService.find).not.toHaveBeenCalled();
        expect(generate.execute).not.toHaveBeenCalled();
    });

    it('swallows generation errors so a detached fire never rejects', async () => {
        const { useCase, generate } = build({ documents: [] });
        generate.execute.mockRejectedValue(new Error('boom'));

        await expect(
            useCase.execute({
                organizationAndTeamData: org,
                repositoryId: 'repo-1',
            }),
        ).resolves.toBeUndefined();
    });

    it('skips when the per-repo lock is already held (concurrent seed)', async () => {
        const { useCase, fossyRulesService, generate } = build({
            lockAcquired: false,
        });

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(fossyRulesService.find).not.toHaveBeenCalled();
        expect(generate.execute).not.toHaveBeenCalled();
    });

    it('releases the lock after a successful run', async () => {
        const { useCase, lock } = build({ documents: [] });

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(lock.release).toHaveBeenCalledTimes(1);
    });

    it('releases the lock even when generation throws', async () => {
        const { useCase, generate, lock } = build({ documents: [] });
        generate.execute.mockRejectedValue(new Error('boom'));

        await useCase.execute({
            organizationAndTeamData: org,
            repositoryId: 'repo-1',
        });

        expect(lock.release).toHaveBeenCalledTimes(1);
    });

    describe('hasPastReviewRulesForRepos', () => {
        it('returns only the repos that carry past-review rules, with a single query', async () => {
            const { useCase, fossyRulesService } = build({
                documents: [
                    {
                        rules: [
                            {
                                repositoryId: 'seeded',
                                origin: FossyRulesOrigin.PAST_REVIEWS,
                            },
                            {
                                repositoryId: 'ide-only',
                                origin: FossyRulesOrigin.REPO_FILE_SYNC,
                            },
                        ],
                    },
                ],
            });

            const seeded = await useCase.hasPastReviewRulesForRepos('org-1', [
                'seeded',
                'ide-only',
                'fresh',
            ]);

            expect(seeded).toEqual(new Set(['seeded']));
            expect(fossyRulesService.find).toHaveBeenCalledTimes(1);
            // Filter is pushed to the DB: only past-review rules for the
            // requested repos, not every rule the org has.
            expect(fossyRulesService.find).toHaveBeenCalledWith({
                organizationId: 'org-1',
                rules: [
                    {
                        repositoryId: 'seeded',
                        origin: FossyRulesOrigin.PAST_REVIEWS,
                    },
                    {
                        repositoryId: 'ide-only',
                        origin: FossyRulesOrigin.PAST_REVIEWS,
                    },
                    {
                        repositoryId: 'fresh',
                        origin: FossyRulesOrigin.PAST_REVIEWS,
                    },
                ],
            });
        });

        it('returns an empty set without querying when no repos are given', async () => {
            const { useCase, fossyRulesService } = build();

            const seeded = await useCase.hasPastReviewRulesForRepos(
                'org-1',
                [],
            );

            expect(seeded.size).toBe(0);
            expect(fossyRulesService.find).not.toHaveBeenCalled();
        });
    });
});
