import { GetInheritedRulesFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/get-inherited-fossy-rules.use-case';
import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

/**
 * Regression coverage for the `/inherited-rules` endpoint that feeds the
 * Fossy Rules settings page.
 *
 *  - Only ACTIVE rules are inherited (paused/pending/deleted do not flow
 *    down to child scopes — the product rule is "rules count/inherit only
 *    when active").
 *  - `severity` is lower-cased to match the scope-local listing path
 *    (`FossyRulesService.find()`), so the same rule never reaches the page
 *    case-mismatched depending on which endpoint served it.
 */
describe('GetInheritedRulesFossyRulesUseCase', () => {
    const organizationAndTeamData: OrganizationAndTeamData = {
        organizationId: 'org-1',
        teamId: 'team-1',
    };

    const REPOSITORY_ID = 'repo-1';

    const buildUseCase = (rules: any[]) => {
        const fossyRulesService = {
            findByOrganizationId: jest.fn().mockResolvedValue({ rules }),
        };

        // Pass the candidate rules straight through so the test exercises
        // the use-case's own status filter and severity normalization
        // rather than the folder-matching logic (covered elsewhere).
        const fossyRulesValidationService = {
            getFossyRulesForFolder: jest
                .fn()
                .mockImplementation((_path: any, candidateRules: any[]) => candidateRules),
        };

        const parametersService = {
            findByKey: jest.fn().mockResolvedValue({
                configValue: {
                    repositories: [{ id: REPOSITORY_ID, directories: [] }],
                },
            }),
        };

        // No rule carries a contextReferenceId, so enrichment collects an
        // empty id set and never calls the batch loader.
        const contextReferenceService = {
            findById: jest.fn(),
            findByIds: jest.fn().mockResolvedValue([]),
        };

        const useCase = new GetInheritedRulesFossyRulesUseCase(
            fossyRulesValidationService as any,
            parametersService as any,
            fossyRulesService as any,
            contextReferenceService as any,
        );

        return { useCase, fossyRulesService };
    };

    it('inherits only ACTIVE global rules', async () => {
        const { useCase } = buildUseCase([
            {
                uuid: 'active-global',
                repositoryId: 'global',
                status: FossyRulesStatus.ACTIVE,
                severity: 'high',
                inheritance: {},
            },
            {
                uuid: 'paused-global',
                repositoryId: 'global',
                status: FossyRulesStatus.PAUSED,
                severity: 'high',
                inheritance: {},
            },
            {
                uuid: 'deleted-global',
                repositoryId: 'global',
                status: FossyRulesStatus.DELETED,
                severity: 'high',
                inheritance: {},
            },
        ]);

        const result = await useCase.execute(
            organizationAndTeamData,
            REPOSITORY_ID,
        );

        const globalUuids = result.globalRules.map((r) => r.uuid);
        expect(globalUuids).toEqual(['active-global']);
    });

    it('lower-cases severity so it matches the scope-local listing path', async () => {
        const { useCase } = buildUseCase([
            {
                uuid: 'mixed-case',
                repositoryId: 'global',
                status: FossyRulesStatus.ACTIVE,
                severity: 'Critical',
                inheritance: {},
            },
        ]);

        const result = await useCase.execute(
            organizationAndTeamData,
            REPOSITORY_ID,
        );

        expect(result.globalRules[0].severity).toBe('critical');
    });

    it('returns empty buckets for the global scope (nothing to inherit)', async () => {
        const { useCase, fossyRulesService } = buildUseCase([]);

        const result = await useCase.execute(organizationAndTeamData, 'global');

        expect(result).toEqual({
            globalRules: [],
            repoRules: [],
            directoryRules: [],
        });
        // Short-circuits before touching the data layer.
        expect(fossyRulesService.findByOrganizationId).not.toHaveBeenCalled();
    });
});
