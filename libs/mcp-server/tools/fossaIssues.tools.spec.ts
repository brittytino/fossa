import { Test, TestingModule } from '@nestjs/testing';

import { CodeManagementService } from '@libs/platform/infrastructure/adapters/services/codeManagement.service';
import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';

import { FossaIssuesTools } from './fossaIssues.tools';

describe('FossaIssuesTools', () => {
    let tools: FossaIssuesTools;
    let mockCodeManagementService: jest.Mocked<
        Pick<CodeManagementService, 'listIssues' | 'getIssue'>
    >;

    beforeEach(async () => {
        mockCodeManagementService = {
            listIssues: jest.fn(),
            getIssue: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FossaIssuesTools,
                {
                    provide: CodeManagementService,
                    useValue: mockCodeManagementService,
                },
            ],
        }).compile();

        tools = module.get<FossaIssuesTools>(FossaIssuesTools);
    });

    it('exposes both generic issue tools', () => {
        expect(tools.getAllTools().map((tool) => tool.name)).toEqual([
            'FOSSA_LIST_ISSUES',
            'FOSSA_GET_ISSUE',
        ]);
    });

    it('lists issues via the code-management facade', async () => {
        const issue = {
            id: '1',
            number: 42,
            title: 'Issue title',
            body: null,
            state: 'open' as const,
            url: 'https://github.com/brittytino/fossa/issues/42',
            labels: ['bug'],
            assignees: ['John'],
            author: null,
            createdAt: '2026-03-01T00:00:00Z',
            updatedAt: '2026-03-01T00:00:00Z',
            closedAt: null,
            platform: PlatformType.GITHUB,
        };
        mockCodeManagementService.listIssues.mockResolvedValue([issue]);

        const result = await tools.listIssues().execute({
            organizationId: 'org',
            teamId: 'team',
            repository: { owner: 'brittytino', name: 'fossa-ai' },
        } as any);

        expect(mockCodeManagementService.listIssues).toHaveBeenCalledWith(
            expect.objectContaining({
                organizationAndTeamData: {
                    organizationId: 'org',
                    teamId: 'team',
                },
                repository: { owner: 'brittytino', name: 'fossa-ai' },
            }),
        );
        expect((result as any).structuredContent).toEqual({
            success: true,
            count: 1,
            data: [issue],
        });
    });

    it('returns null data when the issue is not found', async () => {
        mockCodeManagementService.getIssue.mockResolvedValue(null);

        const result = await tools.getIssue().execute({
            organizationId: 'org',
            teamId: 'team',
            repository: { owner: 'brittytino', name: 'fossa-ai' },
            issueNumber: 999,
        } as any);

        expect(mockCodeManagementService.getIssue).toHaveBeenCalledWith(
            expect.objectContaining({ issueNumber: 999 }),
        );
        expect((result as any).structuredContent).toEqual({
            success: true,
            data: null,
        });
    });
});
