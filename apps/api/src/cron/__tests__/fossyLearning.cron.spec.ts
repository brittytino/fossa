import { FossyLearningCronProvider } from '../fossyLearning.cron';

describe('FossyLearningCronProvider — distributed lock', () => {
    const build = (lockAcquired: boolean) => {
        const teamService = {
            findTeamsWithIntegrations: jest.fn().mockResolvedValue([]),
        };
        const parametersService = { findByKey: jest.fn() };
        const generateFossyRulesUseCase = { execute: jest.fn() };
        const generateInitialFossyRulesUseCase = {
            hasPastReviewRulesForRepos: jest
                .fn()
                .mockResolvedValue(new Set<string>()),
        };
        const lock = { release: jest.fn().mockResolvedValue(undefined) };
        const distributedLockService = {
            acquire: jest.fn().mockResolvedValue(lockAcquired ? lock : null),
        };

        const cron = new FossyLearningCronProvider(
            teamService as any,
            parametersService as any,
            generateFossyRulesUseCase as any,
            generateInitialFossyRulesUseCase as any,
            distributedLockService as any,
        );

        return { cron, teamService, distributedLockService, lock };
    };

    it('skips the run when the lock is already held by another instance', async () => {
        const { cron, teamService, distributedLockService } = build(false);

        await cron.handleCron();

        expect(distributedLockService.acquire).toHaveBeenCalledTimes(1);
        expect(teamService.findTeamsWithIntegrations).not.toHaveBeenCalled();
    });

    it('runs the sweep and releases the lock when it is acquired', async () => {
        const { cron, teamService, lock } = build(true);

        await cron.handleCron();

        expect(teamService.findTeamsWithIntegrations).toHaveBeenCalledTimes(1);
        expect(lock.release).toHaveBeenCalledTimes(1);
    });
});
