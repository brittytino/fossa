import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { IssueStatus } from '@/config/types/general/issues.type';
import {
    IIssuesRepository,
    ISSUES_REPOSITORY_TOKEN,
} from '@/core/domain/issues/contracts/issues.repository';
import { IssuesEntity } from '@/core/domain/issues/entities/issues.entity';
import { IIssue } from '@/core/domain/issues/interfaces/issues.interface';
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

    //#region create
    describe('create', () => {
        const mockIssueInput: Omit<IIssue, 'uuid'> = {
            title: 'Test Issue',
            description: 'This is a test issue description',
            filePath: 'src/test/example.ts',
            language: 'typescript',
            label: LabelType.SECURITY,
            severity: SeverityLevel.HIGH,
            contributingSuggestions: [
                {
                    id: 'suggestion-1',
                    prNumber: 123,
                    prAuthor: {
                        id: 'author-1',
                        name: 'Test Author',
                    },
                    suggestionContent: 'Test suggestion content',
                    oneSentenceSummary: 'Test improvement suggestion',
                    relevantFile: 'src/test/example.ts',
                    language: 'typescript',
                    existingCode: 'const x = 1;',
                    improvedCode: 'const x: number = 1;',
                    startLine: 10,
                    endLine: 10,
                },
            ],
            repository: {
                id: 'repo-123',
                name: 'test-repository',
                full_name: 'organization/test-repository',
                platform: PlatformType.GITHUB,
                url: 'https://github.com/test/repo',
            },
            organizationId: 'org-123',
            age: '2 days',
            status: IssueStatus.OPEN,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
        };

        const mockIssueEntity = new IssuesEntity({
            uuid: uuidv4(),
            ...mockIssueInput,
        });

        it('should create an issue successfully', async () => {
            // Arrange
            mockRepository.create.mockResolvedValue(mockIssueEntity);

            // Act
            const result = await service.create(mockIssueInput);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledTimes(1);
            expect(mockRepository.create).toHaveBeenCalledWith(mockIssueInput);
            expect(result).toBeInstanceOf(IssuesEntity);
            expect(result).toEqual(mockIssueEntity);
            expect(result.uuid).toBeDefined();
            expect(result.title).toBe(mockIssueInput.title);
            expect(result.description).toBe(mockIssueInput.description);
            expect(result.filePath).toBe(mockIssueInput.filePath);
            expect(result.organizationId).toBe(mockIssueInput.organizationId);
        });

        it('should delegate all parameters correctly to repository', async () => {
            // Arrange
            mockRepository.create.mockResolvedValue(mockIssueEntity);

            // Act
            await service.create(mockIssueInput);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: mockIssueInput.title,
                    description: mockIssueInput.description,
                    filePath: mockIssueInput.filePath,
                    language: mockIssueInput.language,
                    label: mockIssueInput.label,
                    severity: mockIssueInput.severity,
                    contributingSuggestions:
                        mockIssueInput.contributingSuggestions,
                    repository: mockIssueInput.repository,
                    organizationId: mockIssueInput.organizationId,
                    status: mockIssueInput.status,
                    createdAt: mockIssueInput.createdAt,
                    updatedAt: mockIssueInput.updatedAt,
                }),
            );
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const errorMessage = 'Database connection failed';
            mockRepository.create.mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(service.create(mockIssueInput)).rejects.toThrow(
                errorMessage,
            );
            expect(mockRepository.create).toHaveBeenCalledTimes(1);
            expect(mockRepository.create).toHaveBeenCalledWith(mockIssueInput);
        });

        it('should handle different severity levels correctly', async () => {
            // Arrange
            const criticalIssue = {
                ...mockIssueInput,
                severity: SeverityLevel.CRITICAL,
                title: 'Critical Security Issue',
            };

            const expectedEntity = new IssuesEntity({
                uuid: uuidv4(),
                ...criticalIssue,
            });

            mockRepository.create.mockResolvedValue(expectedEntity);

            // Act
            const result = await service.create(criticalIssue);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(criticalIssue);
            expect(result.severity).toBe(SeverityLevel.CRITICAL);
            expect(result.title).toBe('Critical Security Issue');
        });

        it('should handle different label types correctly', async () => {
            // Arrange
            const performanceIssue = {
                ...mockIssueInput,
                label: LabelType.PERFORMANCE_AND_OPTIMIZATION,
                title: 'Performance Optimization Needed',
            };

            const expectedEntity = new IssuesEntity({
                uuid: uuidv4(),
                ...performanceIssue,
            });

            mockRepository.create.mockResolvedValue(expectedEntity);

            // Act
            const result = await service.create(performanceIssue);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(
                performanceIssue,
            );
            expect(result.label).toBe(LabelType.PERFORMANCE_AND_OPTIMIZATION);
            expect(result.title).toBe('Performance Optimization Needed');
        });

        it('should create issue without uuid in input', async () => {
            // Arrange
            mockRepository.create.mockResolvedValue(mockIssueEntity);

            // Act
            const result = await service.create(mockIssueInput);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.not.objectContaining({ uuid: expect.anything() }),
            );
            expect(result.uuid).toBeDefined(); // Repository should generate UUID
        });
    });
    //#endregion

    //#region update
    describe('update methods', () => {
        const mockUpdatedIssue = new IssuesEntity({
            uuid: 'updated-issue-uuid',
            title: 'Updated Issue',
            description: 'This issue was updated',
            filePath: 'src/updated/file.ts',
            language: 'typescript',
            label: LabelType.SECURITY,
            severity: SeverityLevel.HIGH,
            contributingSuggestions: [],
            repository: {
                id: 'repo-updated',
                name: 'updated-repo',
                full_name: 'organization/updated-repo',
                platform: PlatformType.GITHUB,
                url: 'https://github.com/organization/updated-repo',
            },
            organizationId: 'org-123',
            age: '1 hour',
            status: IssueStatus.RESOLVED,
            createdAt: '2024-01-06T09:00:00Z',
            updatedAt: '2024-01-06T10:00:00Z',
        });

        describe('updateLabel', () => {
            describe('simulating UpdateIssuePropertyUseCase behavior', () => {
                it('should update issue label (as used in use case)', async () => {
                    // Arrange - Simula como o use case chama o método
                    const uuid = 'test-uuid';
                    const newLabel = LabelType.PERFORMANCE_AND_OPTIMIZATION;
                    const expectedIssue = {
                        ...mockUpdatedIssue,
                        label: newLabel,
                    };

                    mockRepository.updateLabel.mockResolvedValue(
                        expectedIssue as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateLabel(uuid, newLabel);

                    // Assert
                    expect(mockRepository.updateLabel).toHaveBeenCalledTimes(1);
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        uuid,
                        newLabel,
                    );
                    expect(result).toEqual(expectedIssue);
                    expect(result.label).toBe(newLabel);
                });

                it('should return null when issue not found for label update', async () => {
                    // Arrange
                    const nonExistentUuid = 'non-existent-uuid';
                    const label = LabelType.SECURITY;
                    mockRepository.updateLabel.mockResolvedValue(null);

                    // Act
                    const result = await service.updateLabel(
                        nonExistentUuid,
                        label,
                    );

                    // Assert
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        nonExistentUuid,
                        label,
                    );
                    expect(result).toBeNull();
                });
            });

            describe('direct method testing', () => {
                it('should update label to SECURITY', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newLabel = LabelType.SECURITY;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        label: newLabel,
                    };

                    mockRepository.updateLabel.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateLabel(uuid, newLabel);

                    // Assert
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        uuid,
                        newLabel,
                    );
                    expect(result).toEqual(expectedResult);
                    expect(result.label).toBe(LabelType.SECURITY);
                });

                it('should update label to CODE_STYLE', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newLabel = LabelType.CODE_STYLE;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        label: newLabel,
                    };

                    mockRepository.updateLabel.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateLabel(uuid, newLabel);

                    // Assert
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        uuid,
                        newLabel,
                    );
                    expect(result.label).toBe(LabelType.CODE_STYLE);
                });

                it('should delegate parameters correctly to repository', async () => {
                    // Arrange
                    const uuid = 'specific-uuid-123';
                    const label = LabelType.MAINTAINABILITY;
                    mockRepository.updateLabel.mockResolvedValue(
                        mockUpdatedIssue,
                    );

                    // Act
                    await service.updateLabel(uuid, label);

                    // Assert
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        uuid,
                        label,
                    );
                });
            });

            describe('error handling', () => {
                it('should throw error when repository fails', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const label = LabelType.SECURITY;
                    const errorMessage = 'Database update failed';
                    mockRepository.updateLabel.mockRejectedValue(
                        new Error(errorMessage),
                    );

                    // Act & Assert
                    await expect(
                        service.updateLabel(uuid, label),
                    ).rejects.toThrow(errorMessage);
                    expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                        uuid,
                        label,
                    );
                });
            });
        });

        describe('updateSeverity', () => {
            describe('simulating UpdateIssuePropertyUseCase behavior', () => {
                it('should update issue severity (as used in use case)', async () => {
                    // Arrange - Simula como o use case chama o método
                    const uuid = 'test-uuid';
                    const newSeverity = SeverityLevel.CRITICAL;
                    const expectedIssue = {
                        ...mockUpdatedIssue,
                        severity: newSeverity,
                    };

                    mockRepository.updateSeverity.mockResolvedValue(
                        expectedIssue as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateSeverity(
                        uuid,
                        newSeverity,
                    );

                    // Assert
                    expect(mockRepository.updateSeverity).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        uuid,
                        newSeverity,
                    );
                    expect(result).toEqual(expectedIssue);
                    expect(result.severity).toBe(newSeverity);
                });

                it('should return null when issue not found for severity update', async () => {
                    // Arrange
                    const nonExistentUuid = 'non-existent-uuid';
                    const severity = SeverityLevel.HIGH;
                    mockRepository.updateSeverity.mockResolvedValue(null);

                    // Act
                    const result = await service.updateSeverity(
                        nonExistentUuid,
                        severity,
                    );

                    // Assert
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        nonExistentUuid,
                        severity,
                    );
                    expect(result).toBeNull();
                });
            });

            describe('direct method testing', () => {
                it('should update severity to CRITICAL', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newSeverity = SeverityLevel.CRITICAL;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        severity: newSeverity,
                    };

                    mockRepository.updateSeverity.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateSeverity(
                        uuid,
                        newSeverity,
                    );

                    // Assert
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        uuid,
                        newSeverity,
                    );
                    expect(result).toEqual(expectedResult);
                    expect(result.severity).toBe(SeverityLevel.CRITICAL);
                });

                it('should update severity to LOW', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newSeverity = SeverityLevel.LOW;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        severity: newSeverity,
                    };

                    mockRepository.updateSeverity.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateSeverity(
                        uuid,
                        newSeverity,
                    );

                    // Assert
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        uuid,
                        newSeverity,
                    );
                    expect(result.severity).toBe(SeverityLevel.LOW);
                });

                it('should delegate parameters correctly to repository', async () => {
                    // Arrange
                    const uuid = 'specific-uuid-456';
                    const severity = SeverityLevel.MEDIUM;
                    mockRepository.updateSeverity.mockResolvedValue(
                        mockUpdatedIssue,
                    );

                    // Act
                    await service.updateSeverity(uuid, severity);

                    // Assert
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        uuid,
                        severity,
                    );
                });
            });

            describe('error handling', () => {
                it('should throw error when repository fails', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const severity = SeverityLevel.HIGH;
                    const errorMessage = 'Database update failed';
                    mockRepository.updateSeverity.mockRejectedValue(
                        new Error(errorMessage),
                    );

                    // Act & Assert
                    await expect(
                        service.updateSeverity(uuid, severity),
                    ).rejects.toThrow(errorMessage);
                    expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                        uuid,
                        severity,
                    );
                });
            });
        });

        describe('updateStatus', () => {
            describe('simulating UpdateIssuePropertyUseCase behavior', () => {
                it('should update issue status (as used in use case)', async () => {
                    // Arrange - Simula como o use case chama o método
                    const uuid = 'test-uuid';
                    const newStatus = IssueStatus.RESOLVED;
                    const expectedIssue = {
                        ...mockUpdatedIssue,
                        status: newStatus,
                    };

                    mockRepository.updateStatus.mockResolvedValue(
                        expectedIssue as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateStatus(uuid, newStatus);

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledTimes(
                        1,
                    );
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        newStatus,
                    );
                    expect(result).toEqual(expectedIssue);
                    expect(result.status).toBe(newStatus);
                });

                it('should return null when issue not found for status update', async () => {
                    // Arrange
                    const nonExistentUuid = 'non-existent-uuid';
                    const status = IssueStatus.DISMISSED;
                    mockRepository.updateStatus.mockResolvedValue(null);

                    // Act
                    const result = await service.updateStatus(
                        nonExistentUuid,
                        status,
                    );

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        nonExistentUuid,
                        status,
                    );
                    expect(result).toBeNull();
                });
            });

            describe('direct method testing', () => {
                it('should update status to RESOLVED', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newStatus = IssueStatus.RESOLVED;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        status: newStatus,
                    };

                    mockRepository.updateStatus.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateStatus(uuid, newStatus);

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        newStatus,
                    );
                    expect(result).toEqual(expectedResult);
                    expect(result.status).toBe(IssueStatus.RESOLVED);
                });

                it('should update status to DISMISSED', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newStatus = IssueStatus.DISMISSED;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        status: newStatus,
                    };

                    mockRepository.updateStatus.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateStatus(uuid, newStatus);

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        newStatus,
                    );
                    expect(result.status).toBe(IssueStatus.DISMISSED);
                });

                it('should update status to OPEN', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const newStatus = IssueStatus.OPEN;
                    const expectedResult = {
                        ...mockUpdatedIssue,
                        status: newStatus,
                    };

                    mockRepository.updateStatus.mockResolvedValue(
                        expectedResult as IssuesEntity,
                    );

                    // Act
                    const result = await service.updateStatus(uuid, newStatus);

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        newStatus,
                    );
                    expect(result.status).toBe(IssueStatus.OPEN);
                });

                it('should delegate parameters correctly to repository', async () => {
                    // Arrange
                    const uuid = 'specific-uuid-789';
                    const status = IssueStatus.RESOLVED;
                    mockRepository.updateStatus.mockResolvedValue(
                        mockUpdatedIssue,
                    );

                    // Act
                    await service.updateStatus(uuid, status);

                    // Assert
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        status,
                    );
                });
            });

            describe('error handling', () => {
                it('should throw error when repository fails', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const status = IssueStatus.RESOLVED;
                    const errorMessage = 'Database update failed';
                    mockRepository.updateStatus.mockRejectedValue(
                        new Error(errorMessage),
                    );

                    // Act & Assert
                    await expect(
                        service.updateStatus(uuid, status),
                    ).rejects.toThrow(errorMessage);
                    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                        uuid,
                        status,
                    );
                });

                it('should handle concurrent update conflicts', async () => {
                    // Arrange
                    const uuid = 'test-uuid';
                    const status = IssueStatus.RESOLVED;
                    const conflictError = new Error(
                        'Concurrent modification detected',
                    );
                    mockRepository.updateStatus.mockRejectedValue(
                        conflictError,
                    );

                    // Act & Assert
                    await expect(
                        service.updateStatus(uuid, status),
                    ).rejects.toThrow('Concurrent modification detected');
                    expect(mockRepository.updateStatus).toHaveBeenCalledTimes(
                        1,
                    );
                });
            });
        });

        describe('general update behavior', () => {
            it('should handle all update methods consistently', async () => {
                // Arrange
                const uuid = 'consistency-test-uuid';
                const label = LabelType.SECURITY;
                const severity = SeverityLevel.HIGH;
                const status = IssueStatus.OPEN;

                mockRepository.updateLabel.mockResolvedValue(mockUpdatedIssue);
                mockRepository.updateSeverity.mockResolvedValue(
                    mockUpdatedIssue,
                );
                mockRepository.updateStatus.mockResolvedValue(mockUpdatedIssue);

                // Act & Assert
                const labelResult = await service.updateLabel(uuid, label);
                const severityResult = await service.updateSeverity(
                    uuid,
                    severity,
                );
                const statusResult = await service.updateStatus(uuid, status);

                expect(labelResult).toBeDefined();
                expect(severityResult).toBeDefined();
                expect(statusResult).toBeDefined();

                expect(mockRepository.updateLabel).toHaveBeenCalledWith(
                    uuid,
                    label,
                );
                expect(mockRepository.updateSeverity).toHaveBeenCalledWith(
                    uuid,
                    severity,
                );
                expect(mockRepository.updateStatus).toHaveBeenCalledWith(
                    uuid,
                    status,
                );
            });

            it('should maintain issue integrity across updates', async () => {
                // Arrange
                const uuid = 'integrity-test-uuid';
                const updatedIssueWithChanges = {
                    ...mockUpdatedIssue,
                    uuid: uuid,
                    updatedAt: '2024-01-06T11:00:00Z',
                };

                mockRepository.updateLabel.mockResolvedValue(
                    updatedIssueWithChanges as IssuesEntity,
                );

                // Act
                const result = await service.updateLabel(
                    uuid,
                    LabelType.REFACTORING,
                );

                // Assert
                expect(result.uuid).toBe(uuid);
                expect(result.organizationId).toBe(
                    mockUpdatedIssue.organizationId,
                );
                expect(result.repository).toEqual(mockUpdatedIssue.repository);
                expect(result.updatedAt).toBe('2024-01-06T11:00:00Z');
            });
        });
    });
    //#endregion

    //#region addSuggestionIds
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
