import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';

import { ErrorClassification } from '../enums/error-classification.enum';
import { JobStatus } from '../enums/job-status.enum';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

export interface ICodeReviewJob {
    id: string;
    correlationId: string;
    platformType: PlatformType;
    repositoryId: string;
    repositoryName: string;
    pullRequestNumber: number;
    pullRequestData: Record<string, unknown>;
    organizationAndTeamData?: OrganizationAndTeamData;
    status: JobStatus;
    priority: number;
    retryCount: number;
    maxRetries: number;
    errorClassification?: ErrorClassification;
    lastError?: string;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IJobExecutionHistory {
    id: string;
    jobId: string;
    attemptNumber: number;
    status: JobStatus;
    startedAt: Date;
    completedAt?: Date;
    durationMs?: number;
    errorType?: ErrorClassification;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}
