import {
    IPromptExternalReference,
    IFileReference,
    PromptSourceType,
    IPromptReferenceSyncError,
    PromptProcessingStatus,
} from '../interfaces/promptExternalReference.interface';

export class PromptExternalReferenceEntity implements IPromptExternalReference {
    private readonly _uuid?: string;
    private readonly _configKey: string;
    private readonly _sourceType: PromptSourceType;
    private readonly _organizationId: string;
    private readonly _repositoryId: string;
    private readonly _directoryId?: string;
    private readonly _fossyRuleId?: string;
    private readonly _repositoryName: string;
    private readonly _promptHash: string;
    private readonly _contextReferenceId?: string;
    private readonly _contextRequirementsHash?: string;
    private readonly _references: IFileReference[];
    private readonly _syncErrors?: IPromptReferenceSyncError[];
    private readonly _processingStatus: PromptProcessingStatus;
    private readonly _lastProcessedAt: Date;
    private readonly _createdAt?: Date;
    private readonly _updatedAt?: Date;

    constructor(data: IPromptExternalReference) {
        this._uuid = data.uuid;
        this._configKey = data.configKey;
        this._sourceType = data.sourceType;
        this._organizationId = data.organizationId;
        this._repositoryId = data.repositoryId;
        this._directoryId = data.directoryId;
        this._fossyRuleId = data.fossyRuleId;
        this._repositoryName = data.repositoryName;
        this._promptHash = data.promptHash;
        this._contextReferenceId = data.contextReferenceId;
        this._contextRequirementsHash = data.contextRequirementsHash;
        this._references = data.references || [];
        this._syncErrors = data.syncErrors;
        this._processingStatus = data.processingStatus;
        this._lastProcessedAt = data.lastProcessedAt;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    static create(
        data: IPromptExternalReference,
    ): PromptExternalReferenceEntity {
        return new PromptExternalReferenceEntity(data);
    }

    get uuid(): string | undefined {
        return this._uuid;
    }

    get configKey(): string {
        return this._configKey;
    }

    get sourceType(): PromptSourceType {
        return this._sourceType;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    get repositoryId(): string {
        return this._repositoryId;
    }

    get directoryId(): string | undefined {
        return this._directoryId;
    }

    get fossyRuleId(): string | undefined {
        return this._fossyRuleId;
    }

    get repositoryName(): string {
        return this._repositoryName;
    }

    get promptHash(): string {
        return this._promptHash;
    }

    get contextReferenceId(): string | undefined {
        return this._contextReferenceId;
    }

    get contextRequirementsHash(): string | undefined {
        return this._contextRequirementsHash;
    }

    get references(): IFileReference[] {
        return this._references;
    }

    get syncErrors(): IPromptReferenceSyncError[] | undefined {
        return this._syncErrors;
    }

    get processingStatus(): PromptProcessingStatus {
        return this._processingStatus;
    }

    get lastProcessedAt(): Date {
        return this._lastProcessedAt;
    }

    get createdAt(): Date | undefined {
        return this._createdAt;
    }

    get updatedAt(): Date | undefined {
        return this._updatedAt;
    }

    toJson(): IPromptExternalReference {
        return {
            uuid: this._uuid,
            configKey: this._configKey,
            sourceType: this._sourceType,
            organizationId: this._organizationId,
            repositoryId: this._repositoryId,
            directoryId: this._directoryId,
            fossyRuleId: this._fossyRuleId,
            repositoryName: this._repositoryName,
            promptHash: this._promptHash,
            contextReferenceId: this._contextReferenceId,
            contextRequirementsHash: this._contextRequirementsHash,
            references: this._references,
            syncErrors: this._syncErrors,
            processingStatus: this._processingStatus,
            lastProcessedAt: this._lastProcessedAt,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    toObject(): IPromptExternalReference {
        return this.toJson();
    }
}
