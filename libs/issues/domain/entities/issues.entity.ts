import { Entity } from '@libs/core/domain/interfaces/entity';
import { IssueStatus } from '@libs/core/infrastructure/config/types/general/issues.type';
import { LabelType } from '@libs/common/utils/codeManagement/labels';
import { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';
import {
    IContributingSuggestion,
    IRepositoryToIssues,
} from '@libs/issues/domain/interfaces/fossyIssuesManagement.interface';

import { IIssue } from '../interfaces/issues.interface';

export class IssuesEntity implements Entity<IIssue> {
    public uuid?: string;
    public title: string;
    public description: string;
    public filePath: string;
    public language: string;
    public label: LabelType;
    public severity: SeverityLevel;
    public contributingSuggestions: IContributingSuggestion[];
    public status: IssueStatus;
    public repository: IRepositoryToIssues;
    public organizationId: string;
    public createdAt: string;
    public updatedAt: string;
    public owner?: {
        gitId: string;
        username: string;
    };
    public reporter?: {
        gitId: string;
        username: string;
    };

    constructor(issue: IIssue) {
        this.uuid = issue.uuid;
        this.title = issue.title;
        this.description = issue.description;
        this.filePath = issue.filePath;
        this.language = issue.language;
        this.label = issue.label;
        this.severity = issue.severity;
        this.contributingSuggestions = issue.contributingSuggestions;
        this.status = issue.status;
        this.repository = issue.repository;
        this.organizationId = issue.organizationId;
        this.createdAt = issue.createdAt;
        this.updatedAt = issue.updatedAt;
        this.owner = issue.owner;
        this.reporter = issue.reporter;
    }

    public static create(issue: IIssue): IssuesEntity {
        return new IssuesEntity(issue);
    }

    toJson(): IIssue {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            filePath: this.filePath,
            language: this.language,
            label: this.label,
            severity: this.severity,
            contributingSuggestions: this.contributingSuggestions,
            status: this.status,
            repository: this.repository,
            organizationId: this.organizationId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            owner: this.owner,
            reporter: this.reporter,
        };
    }

    toObject(): IIssue {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            filePath: this.filePath,
            language: this.language,
            label: this.label,
            severity: this.severity,
            contributingSuggestions: this.contributingSuggestions,
            status: this.status,
            repository: this.repository,
            organizationId: this.organizationId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            owner: this.owner,
            reporter: this.reporter,
        };
    }
}
