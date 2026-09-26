import { JobStatus } from '../enums/job-status.enum';
import { WorkflowType } from '../enums/workflow-type.enum';
import { IWorkflowJob } from '../interfaces/workflow-job.interface';

export const JOB_QUEUE_SERVICE_TOKEN = Symbol.for('JobQueueService');

export interface IJobQueueService {
    enqueue(
        job: Omit<IWorkflowJob, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<string>;

    getStatus(jobId: string): Promise<IWorkflowJob | null>;

    listJobs(filters: {
        status?: JobStatus;
        workflowType?: WorkflowType;
        organizationId?: string;
        teamId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: IWorkflowJob[];
        total: number;
        limit: number;
        offset: number;
    }>;
}
