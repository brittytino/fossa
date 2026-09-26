import { ErrorClassification } from '../enums/error-classification.enum';
import { JobStatus } from '../enums/job-status.enum';

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
    createdAt: Date;
}
