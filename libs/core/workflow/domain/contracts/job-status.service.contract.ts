import { IJobExecutionHistory } from '../interfaces/job-execution-history.interface';
import { IWorkflowJob } from '../interfaces/workflow-job.interface';

export const JOB_STATUS_SERVICE_TOKEN = Symbol.for('JobStatusService');

export interface IJobStatusService {
    getJobStatus(jobId: string): Promise<IWorkflowJob | null>;

    getJobDetail(jobId: string): Promise<{
        job: IWorkflowJob;
        executionHistory: IJobExecutionHistory[];
    } | null>;

    getMetrics(): Promise<{
        queueSize: number;
        processingCount: number;
        completedToday: number;
        failedToday: number;
        averageProcessingTime: number;
        successRate: number;
        byStatus: Record<string, number>;
    }>;
}
