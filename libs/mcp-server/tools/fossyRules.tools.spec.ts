import { Test, TestingModule } from '@nestjs/testing';

import { CentralizedConfigPrService } from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { FossyRuleSeverity } from '@libs/fossyRules/dtos/create-fossy-rule.dto';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/delete-rule-in-organization-by-id.use-case';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import {
    FossyRulesScope,
    FossyRulesStatus,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { FossyRulesTools } from './fossyRules.tools';

describe('FossyRulesTools.createFossyRule', () => {
    const baseUrl = 'https://app.fossa.local';
    let tools: FossyRulesTools;
    let mockFossyRulesService: jest.Mocked<IFossyRulesService>;
    let mockCentralizedConfigPrService: jest.Mocked<CentralizedConfigPrService>;
    let mockDeleteRuleUseCase: jest.Mocked<DeleteRuleInOrganizationByIdFossyRulesUseCase>;
    let previousBaseUrl: string | undefined;

    beforeEach(async () => {
        previousBaseUrl = process.env.API_USER_INVITE_BASE_URL;
        process.env.API_USER_INVITE_BASE_URL = baseUrl;

        mockFossyRulesService = {
            createOrUpdate: jest.fn(),
        } as unknown as jest.Mocked<IFossyRulesService>;

        mockCentralizedConfigPrService = {
            createMutationPullRequestIfEnabled: jest
                .fn()
                .mockResolvedValue({ mode: 'direct' }),
            resolveDirectoryGroupFolderName: jest.fn().mockResolvedValue(null),
        } as unknown as jest.Mocked<CentralizedConfigPrService>;

        mockDeleteRuleUseCase =
            {} as unknown as jest.Mocked<DeleteRuleInOrganizationByIdFossyRulesUseCase>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FossyRulesTools,
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: mockFossyRulesService,
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: mockCentralizedConfigPrService,
                },
                {
                    provide: DeleteRuleInOrganizationByIdFossyRulesUseCase,
                    useValue: mockDeleteRuleUseCase,
                },
            ],
        }).compile();

        tools = module.get<FossyRulesTools>(FossyRulesTools);
    });

    afterEach(() => {
        process.env.API_USER_INVITE_BASE_URL = previousBaseUrl;
    });

    const runCreate = (overrides?: { repositoryId?: string }) =>
        tools.createFossyRule().execute(
            {
                organizationId: 'org-1',
                fossyRule: {
                    title: 'Avoid console.log',
                    rule: 'Do not commit console.log statements',
                    severity: FossyRuleSeverity.MEDIUM,
                    scope: FossyRulesScope.PULL_REQUEST,
                    repositoryId: overrides?.repositoryId,
                    teamId: 'team-1',
                },
            } as any,
            undefined,
        );

    it('returns a link to the pending standard-rules list when the rule is PENDING', async () => {
        mockFossyRulesService.createOrUpdate.mockResolvedValue({
            uuid: 'rule-123',
            title: 'Avoid console.log',
            rule: 'Do not commit console.log statements',
            status: FossyRulesStatus.PENDING,
            repositoryId: 'repo-1',
        } as any);

        const result = await runCreate({ repositoryId: 'repo-1' });

        const structured = (result as any).structuredContent;
        expect(structured.success).toBe(true);
        expect(structured.data).toEqual(
            expect.objectContaining({
                uuid: 'rule-123',
                status: FossyRulesStatus.PENDING,
            }),
        );
        expect(structured.link).toBe(
            'https://app.fossa.local/settings/code-review/repo-1/fossy-rules?tab=review-rules',
        );
        expect(structured.message).toMatch(/awaiting approval/i);
    });

    it('uses the global scope when no repositoryId is provided', async () => {
        mockFossyRulesService.createOrUpdate.mockResolvedValue({
            uuid: 'rule-456',
            title: 'Avoid console.log',
            rule: 'Do not commit console.log statements',
            status: FossyRulesStatus.PENDING,
            repositoryId: 'global',
        } as any);

        const result = await runCreate();
        const structured = (result as any).structuredContent;

        expect(structured.link).toBe(
            'https://app.fossa.local/settings/code-review/global/fossy-rules?tab=review-rules',
        );
    });

    it('returns the edit URL when the rule lands as ACTIVE (no approval needed)', async () => {
        mockFossyRulesService.createOrUpdate.mockResolvedValue({
            uuid: 'rule-789',
            title: 'Avoid console.log',
            rule: 'Do not commit console.log statements',
            status: FossyRulesStatus.ACTIVE,
            repositoryId: 'repo-1',
        } as any);

        const result = await runCreate({ repositoryId: 'repo-1' });
        const structured = (result as any).structuredContent;

        expect(structured.link).toBe(
            'https://app.fossa.local/settings/code-review/repo-1/fossy-rules/rule-789?tab=review-rules&teamId=team-1',
        );
        expect(structured.message).not.toMatch(/awaiting/i);
    });

    it('returns the PR URL as both prUrl and link in centralized-PR mode', async () => {
        mockCentralizedConfigPrService.createMutationPullRequestIfEnabled.mockResolvedValueOnce(
            {
                mode: 'centralized-pr',
                prUrl: 'https://github.com/org/repo/pull/42',
                message: 'Centralized config is enabled.',
            } as any,
        );

        const result = await runCreate({ repositoryId: 'repo-1' });
        const structured = (result as any).structuredContent;

        expect(structured.prUrl).toBe(
            'https://github.com/org/repo/pull/42',
        );
        expect(structured.link).toBe(
            'https://github.com/org/repo/pull/42',
        );
        expect(mockFossyRulesService.createOrUpdate).not.toHaveBeenCalled();
    });
});

describe('FossyRulesTools.updateFossyRule', () => {
    const baseUrl = 'https://app.fossa.local';
    let tools: FossyRulesTools;
    let mockFossyRulesService: jest.Mocked<IFossyRulesService>;
    let mockCentralizedConfigPrService: jest.Mocked<CentralizedConfigPrService>;
    let mockDeleteRuleUseCase: jest.Mocked<DeleteRuleInOrganizationByIdFossyRulesUseCase>;
    let previousBaseUrl: string | undefined;

    beforeEach(async () => {
        previousBaseUrl = process.env.API_USER_INVITE_BASE_URL;
        process.env.API_USER_INVITE_BASE_URL = baseUrl;

        mockFossyRulesService = {
            findById: jest.fn(),
            updateRuleWithLogging: jest.fn(),
        } as unknown as jest.Mocked<IFossyRulesService>;

        mockCentralizedConfigPrService = {
            createMutationPullRequestIfEnabled: jest
                .fn()
                .mockResolvedValue({ mode: 'direct' }),
            resolveDirectoryGroupFolderName: jest.fn().mockResolvedValue(null),
        } as unknown as jest.Mocked<CentralizedConfigPrService>;

        mockDeleteRuleUseCase =
            {} as unknown as jest.Mocked<DeleteRuleInOrganizationByIdFossyRulesUseCase>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FossyRulesTools,
                {
                    provide: FOSSY_RULES_SERVICE_TOKEN,
                    useValue: mockFossyRulesService,
                },
                {
                    provide: CentralizedConfigPrService,
                    useValue: mockCentralizedConfigPrService,
                },
                {
                    provide: DeleteRuleInOrganizationByIdFossyRulesUseCase,
                    useValue: mockDeleteRuleUseCase,
                },
            ],
        }).compile();

        tools = module.get<FossyRulesTools>(FossyRulesTools);
    });

    afterEach(() => {
        process.env.API_USER_INVITE_BASE_URL = previousBaseUrl;
    });

    const runUpdate = (overrides?: { teamId?: string }) =>
        tools.updateFossyRule().execute(
            {
                organizationId: 'org-1',
                ruleId: 'rule-789',
                fossyRule: {
                    title: 'Updated title',
                    teamId: overrides?.teamId ?? 'team-1',
                },
            } as any,
            undefined,
        );

    it('returns a link to the edit page and a message after a direct update', async () => {
        (mockFossyRulesService.findById as jest.Mock).mockResolvedValue({
            uuid: 'rule-789',
            title: 'Old title',
            rule: 'Some rule body',
            status: FossyRulesStatus.ACTIVE,
            repositoryId: 'repo-1',
        } as any);
        (mockFossyRulesService.updateRuleWithLogging as jest.Mock).mockResolvedValue({
            uuid: 'rule-789',
            title: 'Updated title',
            rule: 'Some rule body',
            status: FossyRulesStatus.ACTIVE,
            repositoryId: 'repo-1',
        } as any);

        const result = await runUpdate();
        const structured = (result as any).structuredContent;

        expect(structured.success).toBe(true);
        expect(structured.link).toBe(
            'https://app.fossa.local/settings/code-review/repo-1/fossy-rules/rule-789?tab=review-rules&teamId=team-1',
        );
        expect(structured.message).toMatch(/updated/i);
    });

    it('returns the PR URL as both prUrl and link in centralized-PR mode on update', async () => {
        (mockFossyRulesService.findById as jest.Mock).mockResolvedValue({
            uuid: 'rule-789',
            title: 'Old title',
            rule: 'Some rule body',
            status: FossyRulesStatus.ACTIVE,
            repositoryId: 'repo-1',
        } as any);
        mockCentralizedConfigPrService.createMutationPullRequestIfEnabled.mockResolvedValueOnce(
            {
                mode: 'centralized-pr',
                prUrl: 'https://github.com/org/repo/pull/99',
                message: 'Centralized config is enabled.',
            } as any,
        );

        const result = await runUpdate();
        const structured = (result as any).structuredContent;

        expect(structured.prUrl).toBe('https://github.com/org/repo/pull/99');
        expect(structured.link).toBe('https://github.com/org/repo/pull/99');
        expect(
            mockFossyRulesService.updateRuleWithLogging,
        ).not.toHaveBeenCalled();
    });

    it('returns success=false when the rule does not exist', async () => {
        (mockFossyRulesService.findById as jest.Mock).mockResolvedValue(null);

        const result = await runUpdate();
        const structured = (result as any).structuredContent;

        expect(structured.success).toBe(false);
        expect(structured.message).toMatch(/not found/i);
    });
});
