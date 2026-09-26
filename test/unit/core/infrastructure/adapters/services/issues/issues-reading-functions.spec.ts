import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { IssueStatus } from '@/config/types/general/issues.type';
import {
    IIssuesRepository,
    ISSUES_REPOSITORY_TOKEN,
} from '@/core/domain/issues/contracts/issues.repository';
import { IssuesEntity } from '@/core/domain/issues/entities/issues.entity';
import { IssuesService } from '@/core/infrastructure/adapters/services/issues/issues.service';
import { PlatformType } from '@/shared/domain/enums/platform-type.enum';
import { LabelType } from '@/shared/utils/codeManagement/labels';
import { SeverityLevel } from '@/shared/utils/enums/severityLevel.enum';

describe('IssuesService', () => {
    let service: IssuesService;
    let mockRepository: jest.Mocked<IIssuesRepository>;

    const mockIssuesRepository = {
        getNativeCollection: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        findByFileAndStatus: jest.fn(),
        find: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateLabel: jest.fn(),
        updateSeverity: jest.fn(),
        updateStatus: jest.fn(),
        addSuggestionIds: jest.fn(),
        findByFilters: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IssuesService,
                {
                    provide: ISSUES_REPOSITORY_TOKEN,
                    useValue: mockIssuesRepository,
                },
            ],
        }).compile();

        service = module.get<IssuesService>(IssuesService);
        mockRepository = module.get<jest.Mocked<IIssuesRepository>>(
            ISSUES_REPOSITORY_TOKEN,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    //#region find and findByFilters
    describe('find and findByFilters', () => {
        const mockIssuesArray = [
            new IssuesEntity({
                uuid: uuidv4(),
                title: 'Security Issue 1',
                description: 'Critical security vulnerability found',
                filePath: 'src/auth/login.ts',
                language: 'typescript',
                label: LabelType.SECURITY,
                severity: SeverityLevel.CRITICAL,
                contributingSuggestions: [
                    {
                        id: 'suggestion-1',
                        prNumber: 101,
                        prAuthor: {
                            id: 'author-1',
                            name: 'John Doe',
                        },
                        suggestionContent: 'Fix security vulnerability',
                        oneSentenceSummary: 'Security improvement needed',
                        relevantFile: 'src/auth/login.ts',
                        language: 'typescript',
                        existingCode: 'password: string',
                        improvedCode: 'password: string (hashed)',
                        startLine: 15,
                        endLine: 15,
                    },
                ],
                repository: {
                    id: 'repo-123',
                    name: 'auth-service',
                    full_name: 'organization/auth-service',
                    platform: PlatformType.GITHUB,
                    url: 'https://github.com/organization/auth-service',
                },
                organizationId: 'org-123',
                age: '1 day',
                status: IssueStatus.OPEN,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z',
            }),
            new IssuesEntity({
                uuid: uuidv4(),
                title: 'Performance Issue 1',
                description: 'Slow database query needs optimization',
                filePath: 'src/database/queries.ts',
                language: 'typescript',
                label: LabelType.PERFORMANCE_AND_OPTIMIZATION,
                severity: SeverityLevel.MEDIUM,
                contributingSuggestions: [
                    {
                        id: 'suggestion-2',
                        prNumber: 102,
                        prAuthor: {
                            id: 'author-2',
                            name: 'Jane Smith',
                        },
                        suggestionContent: 'Optimize database query',
                        oneSentenceSummary: 'Performance optimization needed',
                        relevantFile: 'src/database/queries.ts',
                        language: 'typescript',
                        existingCode: 'SELECT * FROM users',
                        improvedCode: 'SELECT id, name FROM users',
                        startLine: 25,
                        endLine: 25,
                    },
                ],
                repository: {
                    id: 'repo-456',
                    name: 'api-service',
                    full_name: 'organization/api-service',
                    platform: PlatformType.GITHUB,
                    url: 'https://github.com/organization/api-service',
                },
                organizationId: 'org-123',
                age: '3 days',
                status: IssueStatus.OPEN,
                createdAt: '2024-01-03T10:00:00Z',
                updatedAt: '2024-01-03T10:00:00Z',
            }),
        ];

        describe('find - organization-based search', () => {
            it('should find issues by organization id', async () => {
                // Arrange
                const organizationId = 'org-123';
                mockRepository.find.mockResolvedValue(mockIssuesArray);

                // Act
                const result = await service.find(organizationId);

                // Assert
                expect(mockRepository.find).toHaveBeenCalledTimes(1);
                expect(mockRepository.find).toHaveBeenCalledWith(
                    organizationId,
                );
                expect(result).toEqual(mockIssuesArray);
                expect(result).toHaveLength(2);
                expect(result[0]).toBeInstanceOf(IssuesEntity);
                expect(result[1]).toBeInstanceOf(IssuesEntity);
            });

            it('should return empty array when no issues found for organization', async () => {
                // Arrange
                const organizationId = 'org-nonexistent';
                mockRepository.find.mockResolvedValue([]);

                // Act
                const result = await service.find(organizationId);

                // Assert
                expect(mockRepository.find).toHaveBeenCalledWith(
                    organizationId,
                );
                expect(result).toEqual([]);
                expect(result).toHaveLength(0);
            });

            it('should throw error when repository fails for organization search', async () => {
                // Arrange
                const organizationId = 'org-123';
                const errorMessage = 'Database connection failed';
                mockRepository.find.mockRejectedValue(new Error(errorMessage));

                // Act & Assert
                await expect(service.find(organizationId)).rejects.toThrow(
                    errorMessage,
                );
                expect(mockRepository.find).toHaveBeenCalledWith(
                    organizationId,
                );
            });
        });

        describe('findByFilters - complex filter-based search', () => {
            describe('simulating GetIssuesByFiltersUseCase behavior', () => {
                it('should find issues with single filter (as used in use case)', async () => {
                    // Arrange - Simula o filtro que o use case cria
                    const organizationFilter = {
                        organizationId: 'org-123',
                    };

                    mockRepository.findByFilters.mockResolvedValue(
                        mockIssuesArray,
                    );

                    // Act
                    const result =
                        await service.findByFilters(organizationFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        organizationFilter,
                    );
                    expect(result).toEqual(mockIssuesArray);
                    expect(result).toHaveLength(2);
                    expect(result[0]).toBeInstanceOf(IssuesEntity);
                    expect(result[1]).toBeInstanceOf(IssuesEntity);
                });

                it('should find issues with multiple filters (as used in use case)', async () => {
                    // Arrange - Simula filtros complexos do use case
                    const complexFilter = {
                        organizationId: 'org-123',
                        status: IssueStatus.OPEN,
                        severity: SeverityLevel.CRITICAL,
                        repositoryName: 'auth-service',
                    };

                    const filteredResults = [mockIssuesArray[0]]; // Só o primeiro que é crítico
                    mockRepository.findByFilters.mockResolvedValue(
                        filteredResults,
                    );

                    // Act
                    const result = await service.findByFilters(complexFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        complexFilter,
                    );
                    expect(result).toEqual(filteredResults);
                    expect(result).toHaveLength(1);
                    expect(result[0].severity).toBe(SeverityLevel.CRITICAL);
                });

                it('should return empty array when no issues found (as used in use case)', async () => {
                    // Arrange
                    const filter = { organizationId: 'org-nonexistent' };
                    mockRepository.findByFilters.mockResolvedValue([]);

                    // Act
                    const result = await service.findByFilters(filter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        filter,
                    );
                    expect(result).toEqual([]);
                    expect(result).toHaveLength(0);
                });
            });

            describe('direct method testing', () => {
                it('should find issues without filters', async () => {
                    // Arrange
                    mockRepository.findByFilters.mockResolvedValue(
                        mockIssuesArray,
                    );

                    // Act
                    const result = await service.findByFilters();

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        undefined,
                    );
                    expect(result).toEqual(mockIssuesArray);
                });

                it('should find issues by severity filter', async () => {
                    // Arrange
                    const severityFilter = {
                        severity: SeverityLevel.CRITICAL,
                    };
                    const criticalIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(
                        criticalIssues,
                    );

                    // Act
                    const result = await service.findByFilters(severityFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        severityFilter,
                    );
                    expect(result).toEqual(criticalIssues);
                    expect(
                        result.every(
                            (issue) =>
                                issue.severity === SeverityLevel.CRITICAL,
                        ),
                    ).toBe(true);
                });

                it('should find issues by label/category filter', async () => {
                    // Arrange
                    const categoryFilter = {
                        category: LabelType.SECURITY,
                    };
                    const securityIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(
                        securityIssues,
                    );

                    // Act
                    const result = await service.findByFilters(categoryFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        categoryFilter,
                    );
                    expect(result).toEqual(securityIssues);
                    expect(
                        result.every(
                            (issue) => issue.label === LabelType.SECURITY,
                        ),
                    ).toBe(true);
                });

                it('should find issues by repository name filter', async () => {
                    // Arrange
                    const repositoryFilter = {
                        repositoryName: 'auth-service',
                    };
                    const authServiceIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(
                        authServiceIssues,
                    );

                    // Act
                    const result =
                        await service.findByFilters(repositoryFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        repositoryFilter,
                    );
                    expect(result).toEqual(authServiceIssues);
                });

                it('should find issues by PR number filter', async () => {
                    // Arrange
                    const prNumberFilter = {
                        prNumber: 101,
                    };
                    const prIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(prIssues);

                    // Act
                    const result = await service.findByFilters(prNumberFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        prNumberFilter,
                    );
                    expect(result).toEqual(prIssues);
                });

                it('should find issues by PR author filter', async () => {
                    // Arrange
                    const prAuthorFilter = {
                        prAuthor: 'John Doe',
                    };
                    const authorIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(
                        authorIssues,
                    );

                    // Act
                    const result = await service.findByFilters(prAuthorFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        prAuthorFilter,
                    );
                    expect(result).toEqual(authorIssues);
                });

                it('should find issues by file path filter', async () => {
                    // Arrange
                    const filePathFilter = {
                        filePath: 'src/auth/login.ts',
                    };
                    const fileIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(fileIssues);

                    // Act
                    const result = await service.findByFilters(filePathFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        filePathFilter,
                    );
                    expect(result).toEqual(fileIssues);
                });

                it('should find issues by title filter', async () => {
                    // Arrange
                    const titleFilter = {
                        title: 'Security Issue',
                    };
                    const titleIssues = [mockIssuesArray[0]];

                    mockRepository.findByFilters.mockResolvedValue(titleIssues);

                    // Act
                    const result = await service.findByFilters(titleFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        titleFilter,
                    );
                    expect(result).toEqual(titleIssues);
                });
            });

            describe('error handling', () => {
                it('should throw error when repository fails', async () => {
                    // Arrange
                    const filter = { organizationId: 'org-123' };
                    const errorMessage = 'Database connection failed';
                    mockRepository.findByFilters.mockRejectedValue(
                        new Error(errorMessage),
                    );

                    // Act & Assert
                    await expect(service.findByFilters(filter)).rejects.toThrow(
                        errorMessage,
                    );
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        filter,
                    );
                });

                it('should handle network timeout errors', async () => {
                    // Arrange
                    const filter = { organizationId: 'org-123' };
                    const timeoutError = new Error('Request timeout');
                    mockRepository.findByFilters.mockRejectedValue(
                        timeoutError,
                    );

                    // Act & Assert
                    await expect(service.findByFilters(filter)).rejects.toThrow(
                        'Request timeout',
                    );
                    expect(mockRepository.findByFilters).toHaveBeenCalledTimes(
                        1,
                    );
                });
            });

            describe('edge cases', () => {
                it('should handle null filter gracefully', async () => {
                    // Arrange
                    mockRepository.findByFilters.mockResolvedValue(
                        mockIssuesArray,
                    );

                    // Act
                    const result = await service.findByFilters(null);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        null,
                    );
                    expect(result).toEqual(mockIssuesArray);
                });

                it('should handle empty filter object', async () => {
                    // Arrange
                    const emptyFilter = {};
                    mockRepository.findByFilters.mockResolvedValue(
                        mockIssuesArray,
                    );

                    // Act
                    const result = await service.findByFilters(emptyFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        emptyFilter,
                    );
                    expect(result).toEqual(mockIssuesArray);
                });

                it('should delegate complex filters correctly', async () => {
                    // Arrange
                    const complexFilter = {
                        organizationId: 'org-123',
                        status: IssueStatus.OPEN,
                        severity: SeverityLevel.HIGH,
                        category: LabelType.SECURITY,
                        repositoryName: 'auth-service',
                        prNumber: 101,
                        prAuthor: 'John Doe',
                        filePath: 'src/auth',
                        title: 'security',
                        beforeAt: '2024-01-01',
                        afterAt: '2024-01-02',
                    };

                    mockRepository.findByFilters.mockResolvedValue([
                        mockIssuesArray[0],
                    ]);

                    // Act
                    const result = await service.findByFilters(complexFilter);

                    // Assert
                    expect(mockRepository.findByFilters).toHaveBeenCalledWith(
                        expect.objectContaining({
                            organizationId: 'org-123',
                            status: IssueStatus.OPEN,
                            severity: SeverityLevel.HIGH,
                            category: LabelType.SECURITY,
                            repositoryName: 'auth-service',
                            prNumber: 101,
                            prAuthor: 'John Doe',
                            filePath: 'src/auth',
                            title: 'security',
                            beforeAt: '2024-01-01',
                            afterAt: '2024-01-02',
                        }),
                    );
                    expect(result).toHaveLength(1);
                });
            });
        });
    });
    //#endregion

    //#region findById
    describe('findById', () => {
        const mockIssueEntity = new IssuesEntity({
            uuid: 'issue-uuid-123',
            title: 'Test Issue for FindById',
            description: 'This is a test issue for findById method',
            filePath: 'src/components/Button.tsx',
            language: 'typescript',
            label: LabelType.CODE_STYLE,
            severity: SeverityLevel.LOW,
            contributingSuggestions: [
                {
                    id: 'suggestion-findbyid',
                    prNumber: 205,
                    prAuthor: {
                        id: 'author-findbyid',
                        name: 'Test Author',
                    },
                    suggestionContent: 'Improve code style',
                    oneSentenceSummary: 'Code style improvement',
                    relevantFile: 'src/components/Button.tsx',
                    language: 'typescript',
                    existingCode: 'const button = () => {}',
                    improvedCode: 'const Button = (): JSX.Element => {}',
                    startLine: 5,
                    endLine: 5,
                },
            ],
            repository: {
                id: 'repo-findbyid',
                name: 'frontend-app',
                full_name: 'organization/frontend-app',
                platform: PlatformType.GITHUB,
                url: 'https://github.com/organization/frontend-app',
            },
            organizationId: 'org-123',
            age: '2 hours',
            status: IssueStatus.OPEN,
            createdAt: '2024-01-05T08:00:00Z',
            updatedAt: '2024-01-05T08:00:00Z',
        });

        describe('simulating GetIssueByIdUseCase behavior', () => {
            it('should find issue by id (as used in use case)', async () => {
                // Arrange - Simula como o use case chama o método
                const issueId = 'issue-uuid-123';
                mockRepository.findById.mockResolvedValue(mockIssueEntity);

                // Act
                const result = await service.findById(issueId);

                // Assert
                expect(mockRepository.findById).toHaveBeenCalledTimes(1);
                expect(mockRepository.findById).toHaveBeenCalledWith(issueId);
                expect(result).toEqual(mockIssueEntity);
                expect(result).toBeInstanceOf(IssuesEntity);
                expect(result.uuid).toBe(issueId);
            });

            it('should return null when issue not found (as used in use case)', async () => {
                // Arrange - Simula quando o issue não existe
                const nonExistentId = 'non-existent-uuid';
                mockRepository.findById.mockResolvedValue(null);

                // Act
                const result = await service.findById(nonExistentId);

                // Assert
                expect(mockRepository.findById).toHaveBeenCalledWith(
                    nonExistentId,
                );
                expect(result).toBeNull();
            });
        });

        describe('direct method testing', () => {
            it('should find issue by valid uuid', async () => {
                // Arrange
                const uuid = 'valid-uuid-123';
                mockRepository.findById.mockResolvedValue(mockIssueEntity);

                // Act
                const result = await service.findById(uuid);

                // Assert
                expect(mockRepository.findById).toHaveBeenCalledWith(uuid);
                expect(result).toEqual(mockIssueEntity);
                expect(result.uuid).toBe(mockIssueEntity.uuid);
            });

            it('should return null for non-existent uuid', async () => {
                // Arrange
                const nonExistentUuid = 'non-existent-uuid';
                mockRepository.findById.mockResolvedValue(null);

                // Act
                const result = await service.findById(nonExistentUuid);

                // Assert
                expect(mockRepository.findById).toHaveBeenCalledWith(
                    nonExistentUuid,
                );
                expect(result).toBeNull();
            });

            it('should handle empty string uuid', async () => {
                // Arrange
                const emptyUuid = '';
                mockRepository.findById.mockResolvedValue(null);

                // Act
                const result = await service.findById(emptyUuid);

                // Assert
                expect(mockRepository.findById).toHaveBeenCalledWith(emptyUuid);
                expect(result).toBeNull();
            });
        });

        describe('error handling', () => {
            it('should throw error when repository fails', async () => {
                // Arrange
                const uuid = 'test-uuid';
                const errorMessage = 'Database query failed';
                mockRepository.findById.mockRejectedValue(
                    new Error(errorMessage),
                );

                // Act & Assert
                await expect(service.findById(uuid)).rejects.toThrow(
                    errorMessage,
                );
                expect(mockRepository.findById).toHaveBeenCalledWith(uuid);
            });

            it('should handle repository connection errors', async () => {
                // Arrange
                const uuid = 'test-uuid';
                const connectionError = new Error('Connection timeout');
                mockRepository.findById.mockRejectedValue(connectionError);

                // Act & Assert
                await expect(service.findById(uuid)).rejects.toThrow(
                    'Connection timeout',
                );
                expect(mockRepository.findById).toHaveBeenCalledTimes(1);
            });
        });
    });
    //#endregion

    //#region findByFileAndStatus
    describe('findByFileAndStatus', () => {
        const mockIssuesForFile = [
            new IssuesEntity({
                uuid: 'file-issue-1',
                title: 'Issue in Authentication File',
                description: 'Security issue found in auth file',
                filePath: 'src/auth/login.ts',
                language: 'typescript',
                label: LabelType.SECURITY,
                severity: SeverityLevel.HIGH,
                contributingSuggestions: [
                    {
                        id: 'suggestion-auth-1',
                        prNumber: 301,
                        prAuthor: {
                            id: 'author-auth',
                            name: 'Security Expert',
                        },
                        suggestionContent: 'Fix authentication vulnerability',
                        oneSentenceSummary: 'Authentication security fix',
                        relevantFile: 'src/auth/login.ts',
                        language: 'typescript',
                        existingCode: 'if (password === inputPassword)',
                        improvedCode:
                            'if (bcrypt.compare(inputPassword, password))',
                        startLine: 42,
                        endLine: 42,
                    },
                ],
                repository: {
                    id: 'repo-auth',
                    name: 'auth-service',
                    full_name: 'organization/auth-service',
                    platform: PlatformType.GITHUB,
                    url: 'https://github.com/organization/auth-service',
                },
                organizationId: 'org-123',
                age: '2 hours',
                status: IssueStatus.OPEN,
                createdAt: '2024-01-07T10:00:00Z',
                updatedAt: '2024-01-07T10:00:00Z',
            }),
            new IssuesEntity({
                uuid: 'file-issue-2',
                title: 'Another Issue in Same File',
                description: 'Performance issue in same auth file',
                filePath: 'src/auth/login.ts',
                language: 'typescript',
                label: LabelType.PERFORMANCE_AND_OPTIMIZATION,
                severity: SeverityLevel.MEDIUM,
                contributingSuggestions: [],
                repository: {
                    id: 'repo-auth',
                    name: 'auth-service',
                    full_name: 'organization/auth-service',
                    platform: PlatformType.GITHUB,
                    url: 'https://github.com/organization/auth-service',
                },
                organizationId: 'org-123',
                age: '4 hours',
                status: IssueStatus.RESOLVED,
                createdAt: '2024-01-07T08:00:00Z',
                updatedAt: '2024-01-07T09:00:00Z',
            }),
        ];

        describe('with status parameter', () => {
            it('should find issues by file and status OPEN', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const status = IssueStatus.OPEN;
                const expectedResults = [mockIssuesForFile[0]]; // Só o primeiro é OPEN

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    expectedResults,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(
                    mockRepository.findByFileAndStatus,
                ).toHaveBeenCalledTimes(1);
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toEqual(expectedResults);
                expect(result).toHaveLength(1);
                expect(result[0].status).toBe(IssueStatus.OPEN);
                expect(result[0].filePath).toBe(filePath);
            });

            it('should find issues by file and status RESOLVED', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const status = IssueStatus.RESOLVED;
                const expectedResults = [mockIssuesForFile[1]]; // Só o segundo é RESOLVED

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    expectedResults,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toEqual(expectedResults);
                expect(result[0].status).toBe(IssueStatus.RESOLVED);
            });

            it('should find issues by file and status DISMISSED', async () => {
                // Arrange
                const organizationId = 'org-456';
                const repositoryId = 'repo-test';
                const filePath = 'src/components/Button.tsx';
                const status = IssueStatus.DISMISSED;

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toEqual([]);
            });
        });

        describe('without status parameter', () => {
            it('should find all issues for file when status is undefined', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                // status é undefined (não passado)

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual(mockIssuesForFile);
                expect(result).toHaveLength(2);
                expect(
                    result.every((issue) => issue.filePath === filePath),
                ).toBe(true);
            });

            it('should find all issues for file when status is explicitly undefined', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const status = undefined;

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual(mockIssuesForFile);
                expect(result).toHaveLength(2);
            });
        });

        describe('different file paths', () => {
            it('should find issues for TypeScript files', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-frontend';
                const filePath = 'src/components/Header.tsx';
                const status = IssueStatus.OPEN;

                mockRepository.findByFileAndStatus.mockResolvedValue([
                    mockIssuesForFile[0],
                ]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toHaveLength(1);
            });

            it('should find issues for JavaScript files', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-backend';
                const filePath = 'src/utils/helpers.js';
                const status = IssueStatus.OPEN;

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toEqual([]);
            });

            it('should find issues for nested file paths', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-api';
                const filePath =
                    'src/modules/user/controllers/userController.ts';

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual(mockIssuesForFile);
            });
        });

        describe('different organizations and repositories', () => {
            it('should delegate correct organization and repository IDs', async () => {
                // Arrange
                const organizationId = 'org-different-456';
                const repositoryId = 'repo-different-789';
                const filePath = 'src/test.ts';
                const status = IssueStatus.OPEN;

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    'org-different-456',
                    'repo-different-789',
                    'src/test.ts',
                    IssueStatus.OPEN,
                );
            });

            it('should handle UUID format IDs correctly', async () => {
                // Arrange
                const organizationId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
                const repositoryId = 'f1e2d3c4-b5a6-9876-fedc-ba0987654321';
                const filePath = 'src/main.ts';

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual(mockIssuesForFile);
            });
        });

        describe('return value scenarios', () => {
            it('should return null when repository returns null', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-404';
                const filePath = 'src/nonexistent.ts';
                const status = IssueStatus.OPEN;

                mockRepository.findByFileAndStatus.mockResolvedValue(null);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
                expect(result).toBeNull();
            });

            it('should return empty array when no issues found', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-empty';
                const filePath = 'src/clean-file.ts';

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual([]);
                expect(result).toHaveLength(0);
            });

            it('should return multiple issues for same file', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(result).toEqual(mockIssuesForFile);
                expect(result).toHaveLength(2);
                expect(
                    result.every((issue) => issue.filePath === filePath),
                ).toBe(true);
                expect(
                    result.every(
                        (issue) => issue.organizationId === organizationId,
                    ),
                ).toBe(true);
            });
        });

        describe('error handling', () => {
            it('should throw error when repository fails', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const status = IssueStatus.OPEN;
                const errorMessage = 'Database query failed';

                mockRepository.findByFileAndStatus.mockRejectedValue(
                    new Error(errorMessage),
                );

                // Act & Assert
                await expect(
                    service.findByFileAndStatus(
                        organizationId,
                        repositoryId,
                        filePath,
                        status,
                    ),
                ).rejects.toThrow(errorMessage);
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );
            });

            it('should throw error when connection times out', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const timeoutError = new Error('Connection timeout');

                mockRepository.findByFileAndStatus.mockRejectedValue(
                    timeoutError,
                );

                // Act & Assert
                await expect(
                    service.findByFileAndStatus(
                        organizationId,
                        repositoryId,
                        filePath,
                    ),
                ).rejects.toThrow('Connection timeout');
                expect(
                    mockRepository.findByFileAndStatus,
                ).toHaveBeenCalledTimes(1);
            });

            it('should handle invalid status parameter gracefully', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-auth';
                const filePath = 'src/auth/login.ts';
                const invalidStatus = 'invalid-status' as IssueStatus;
                const validationError = new Error('Invalid status value');

                mockRepository.findByFileAndStatus.mockRejectedValue(
                    validationError,
                );

                // Act & Assert
                await expect(
                    service.findByFileAndStatus(
                        organizationId,
                        repositoryId,
                        filePath,
                        invalidStatus,
                    ),
                ).rejects.toThrow('Invalid status value');
            });
        });

        describe('edge cases', () => {
            it('should handle empty string parameters', async () => {
                // Arrange
                const organizationId = '';
                const repositoryId = '';
                const filePath = '';

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    '',
                    '',
                    '',
                    undefined,
                );
                expect(result).toEqual([]);
            });

            it('should handle special characters in file path', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-special';
                const filePath = 'src/components/special-chars@#$.tsx';

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    filePath,
                    undefined,
                );
                expect(result).toEqual([]);
            });

            it('should handle very long file paths', async () => {
                // Arrange
                const organizationId = 'org-123';
                const repositoryId = 'repo-long';
                const longFilePath =
                    'src/very/long/nested/directory/structure/with/many/levels/deep/file.ts';

                mockRepository.findByFileAndStatus.mockResolvedValue(
                    mockIssuesForFile,
                );

                // Act
                const result = await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    longFilePath,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    organizationId,
                    repositoryId,
                    longFilePath,
                    undefined,
                );
                expect(result).toEqual(mockIssuesForFile);
            });
        });

        describe('parameter delegation verification', () => {
            it('should pass all parameters correctly to repository', async () => {
                // Arrange
                const organizationId = 'test-org-id';
                const repositoryId = 'test-repo-id';
                const filePath = 'test/file/path.ts';
                const status = IssueStatus.DISMISSED;

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                await service.findByFileAndStatus(
                    organizationId,
                    repositoryId,
                    filePath,
                    status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    expect.stringMatching('test-org-id'),
                    expect.stringMatching('test-repo-id'),
                    expect.stringMatching('test/file/path.ts'),
                    IssueStatus.DISMISSED,
                );
            });

            it('should not modify parameters before delegation', async () => {
                // Arrange
                const originalParams = {
                    organizationId: 'original-org',
                    repositoryId: 'original-repo',
                    filePath: 'original/path.ts',
                    status: IssueStatus.OPEN,
                };

                mockRepository.findByFileAndStatus.mockResolvedValue([]);

                // Act
                await service.findByFileAndStatus(
                    originalParams.organizationId,
                    originalParams.repositoryId,
                    originalParams.filePath,
                    originalParams.status,
                );

                // Assert
                expect(mockRepository.findByFileAndStatus).toHaveBeenCalledWith(
                    originalParams.organizationId,
                    originalParams.repositoryId,
                    originalParams.filePath,
                    originalParams.status,
                );
            });
        });
    });
    //#endregion

    describe('addSuggestionIds', () => {
        const mockIssueWithSuggestions = new IssuesEntity({
            uuid: 'issue-with-suggestions',
            title: 'Issue with Added Suggestions',
            description: 'This issue has suggestions added to it',
            filePath: 'src/services/api.ts',
            language: 'typescript',
            label: LabelType.REFACTORING,
            severity: SeverityLevel.MEDIUM,
            contributingSuggestions: [
                {
                    id: 'existing-suggestion-1',
                    prNumber: 401,
                    prAuthor: {
                        id: 'author-existing',
                        name: 'Existing Author',
                    },
                    suggestionContent: 'Existing suggestion',
                    oneSentenceSummary: 'Existing refactoring suggestion',
                    relevantFile: 'src/services/api.ts',
                    language: 'typescript',
                    existingCode: 'function oldApi() {}',
                    improvedCode: 'function newApi() {}',
                    startLine: 10,
                    endLine: 10,
                },
                {
                    id: 'new-suggestion-1',
                    prNumber: 402,
                    prAuthor: {
                        id: 'author-new-1',
                        name: 'New Author 1',
                    },
                    suggestionContent: 'First new suggestion added',
                    oneSentenceSummary: 'New suggestion 1',
                    relevantFile: 'src/services/api.ts',
                    language: 'typescript',
                    existingCode: 'const old = 1;',
                    improvedCode: 'const improved = 1;',
                    startLine: 20,
                    endLine: 20,
                },
                {
                    id: 'new-suggestion-2',
                    prNumber: 403,
                    prAuthor: {
                        id: 'author-new-2',
                        name: 'New Author 2',
                    },
                    suggestionContent: 'Second new suggestion added',
                    oneSentenceSummary: 'New suggestion 2',
                    relevantFile: 'src/services/api.ts',
                    language: 'typescript',
                    existingCode: 'let temp = null;',
                    improvedCode: 'let temp: string | null = null;',
                    startLine: 30,
                    endLine: 30,
                },
            ],
            repository: {
                id: 'repo-suggestions',
                name: 'api-service',
                full_name: 'organization/api-service',
                platform: PlatformType.GITHUB,
                url: 'https://github.com/organization/api-service',
            },
            organizationId: 'org-123',
            age: '30 minutes',
            status: IssueStatus.OPEN,
            createdAt: '2024-01-08T12:00:00Z',
            updatedAt: '2024-01-08T12:30:00Z',
        });

        describe('adding single suggestion', () => {
            it('should add single suggestion ID successfully', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = ['new-suggestion-123'];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledTimes(
                    1,
                );
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
                expect(result).toBeInstanceOf(IssuesEntity);
                expect(result.uuid).toBe(mockIssueWithSuggestions.uuid);
            });

            it('should return null when issue not found', async () => {
                // Arrange
                const nonExistentUuid = 'non-existent-uuid';
                const suggestionIds = ['suggestion-1'];

                mockRepository.addSuggestionIds.mockResolvedValue(null);

                // Act
                const result = await service.addSuggestionIds(
                    nonExistentUuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    nonExistentUuid,
                    suggestionIds,
                );
                expect(result).toBeNull();
            });
        });

        describe('adding multiple suggestions', () => {
            it('should add multiple suggestion IDs successfully', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = [
                    'suggestion-1',
                    'suggestion-2',
                    'suggestion-3',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
                expect(result.contributingSuggestions).toHaveLength(3);
            });

            it('should handle large number of suggestion IDs', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = Array.from(
                    { length: 50 },
                    (_, i) => `suggestion-${i + 1}`,
                );

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
                expect(suggestionIds).toHaveLength(50);
            });

            it('should handle duplicate suggestion IDs in array', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = [
                    'suggestion-1',
                    'suggestion-2',
                    'suggestion-1',
                    'suggestion-3',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });
        });

        describe('empty and edge cases', () => {
            it('should handle empty suggestion IDs array', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds: string[] = [];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle suggestion IDs with special characters', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = [
                    'suggestion-@#$',
                    'suggestion_with_underscores',
                    'suggestion-with-dashes',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle very long suggestion IDs', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const longSuggestionId = 'a'.repeat(1000);
                const suggestionIds = [longSuggestionId];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle UUID format suggestion IDs', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = [
                    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    'f1e2d3c4-b5a6-9876-fedc-ba0987654321',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });
        });

        describe('different issue UUIDs', () => {
            it('should handle standard UUID format', async () => {
                // Arrange
                const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
                const suggestionIds = ['suggestion-1'];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle custom ID format', async () => {
                // Arrange
                const uuid = 'custom_issue_id_123';
                const suggestionIds = ['suggestion-custom'];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle empty string UUID', async () => {
                // Arrange
                const uuid = '';
                const suggestionIds = ['suggestion-1'];

                mockRepository.addSuggestionIds.mockResolvedValue(null);

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toBeNull();
            });
        });

        describe('error handling', () => {
            it('should throw error when repository fails', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = ['suggestion-1'];
                const errorMessage = 'Database update failed';

                mockRepository.addSuggestionIds.mockRejectedValue(
                    new Error(errorMessage),
                );

                // Act & Assert
                await expect(
                    service.addSuggestionIds(uuid, suggestionIds),
                ).rejects.toThrow(errorMessage);
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
            });

            it('should handle connection timeout errors', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = ['suggestion-1', 'suggestion-2'];
                const timeoutError = new Error('Connection timeout');

                mockRepository.addSuggestionIds.mockRejectedValue(timeoutError);

                // Act & Assert
                await expect(
                    service.addSuggestionIds(uuid, suggestionIds),
                ).rejects.toThrow('Connection timeout');
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledTimes(
                    1,
                );
            });

            it('should handle validation errors for invalid suggestion IDs', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = ['invalid-suggestion'];
                const validationError = new Error(
                    'Invalid suggestion ID format',
                );

                mockRepository.addSuggestionIds.mockRejectedValue(
                    validationError,
                );

                // Act & Assert
                await expect(
                    service.addSuggestionIds(uuid, suggestionIds),
                ).rejects.toThrow('Invalid suggestion ID format');
            });

            it('should handle concurrent modification errors', async () => {
                // Arrange
                const uuid = 'test-issue-uuid';
                const suggestionIds = ['suggestion-1'];
                const concurrencyError = new Error(
                    'Issue was modified by another process',
                );

                mockRepository.addSuggestionIds.mockRejectedValue(
                    concurrencyError,
                );

                // Act & Assert
                await expect(
                    service.addSuggestionIds(uuid, suggestionIds),
                ).rejects.toThrow('Issue was modified by another process');
            });
        });

        describe('parameter delegation verification', () => {
            it('should pass all parameters correctly to repository', async () => {
                // Arrange
                const uuid = 'precise-test-uuid';
                const suggestionIds = [
                    'precise-suggestion-1',
                    'precise-suggestion-2',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                await service.addSuggestionIds(uuid, suggestionIds);

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    expect.stringMatching('precise-test-uuid'),
                    expect.arrayContaining([
                        'precise-suggestion-1',
                        'precise-suggestion-2',
                    ]),
                );
            });

            it('should not modify parameters before delegation', async () => {
                // Arrange
                const originalUuid = 'original-uuid';
                const originalSuggestionIds = ['original-1', 'original-2'];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                await service.addSuggestionIds(
                    originalUuid,
                    originalSuggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    originalUuid,
                    originalSuggestionIds,
                );

                // Verificar que os parâmetros originais não foram modificados
                expect(originalUuid).toBe('original-uuid');
                expect(originalSuggestionIds).toEqual([
                    'original-1',
                    'original-2',
                ]);
            });

            it('should handle array reference correctly', async () => {
                // Arrange
                const uuid = 'test-uuid';
                const suggestionIds = ['ref-test-1', 'ref-test-2'];
                const suggestionIdsRef = suggestionIds; // Mesma referência

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                await service.addSuggestionIds(uuid, suggestionIdsRef);

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIdsRef,
                );
            });
        });

        describe('integration-like scenarios', () => {
            it('should work with typical suggestion ID patterns', async () => {
                // Arrange - Simula IDs reais que poderiam vir de um sistema de sugestões
                const uuid = 'issue-12345';
                const suggestionIds = [
                    'suggestion_pr_101_line_25',
                    'suggestion_pr_102_line_30',
                    'suggestion_pr_103_line_45',
                ];

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    suggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
            });

            it('should handle batch addition of suggestions', async () => {
                // Arrange - Simula adição em lote de muitas sugestões
                const uuid = 'batch-issue-uuid';
                const batchSuggestionIds = Array.from(
                    { length: 25 },
                    (_, i) => `batch_suggestion_${i + 1}`,
                );

                mockRepository.addSuggestionIds.mockResolvedValue(
                    mockIssueWithSuggestions,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    batchSuggestionIds,
                );

                // Assert
                expect(mockRepository.addSuggestionIds).toHaveBeenCalledWith(
                    uuid,
                    batchSuggestionIds,
                );
                expect(result).toEqual(mockIssueWithSuggestions);
                expect(batchSuggestionIds).toHaveLength(25);
            });

            it('should maintain issue data integrity after adding suggestions', async () => {
                // Arrange
                const uuid = 'integrity-test-uuid';
                const suggestionIds = ['integrity-suggestion-1'];
                const updatedIssue = {
                    ...mockIssueWithSuggestions,
                    updatedAt: new Date().toISOString(),
                };

                mockRepository.addSuggestionIds.mockResolvedValue(
                    updatedIssue as IssuesEntity,
                );

                // Act
                const result = await service.addSuggestionIds(
                    uuid,
                    suggestionIds,
                );

                // Assert
                expect(result.uuid).toBe(mockIssueWithSuggestions.uuid);
                expect(result.organizationId).toBe(
                    mockIssueWithSuggestions.organizationId,
                );
                expect(result.repository).toEqual(
                    mockIssueWithSuggestions.repository,
                );
                expect(result.title).toBe(mockIssueWithSuggestions.title);
                expect(result.status).toBe(mockIssueWithSuggestions.status);
                // updatedAt deve ter sido atualizado
                expect(result.updatedAt).not.toBe(
                    mockIssueWithSuggestions.updatedAt,
                );
            });
        });
    });
    //#endregion
});
