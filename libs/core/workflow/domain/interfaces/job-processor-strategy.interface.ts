import { WorkflowType } from '../enums/workflow-type.enum';

export interface IJobProcessorStrategy {
    /**
     * The type of workflow this processor handles
     */
    readonly workflowType: WorkflowType;

    /**
     * Process the job logic
     */
    process(jobId: string): Promise<void>;
}
