export const JOB_PROCESSOR_ROUTER_TOKEN = Symbol.for('JobProcessorRouter');

export interface IJobProcessorRouter {
    /**
     * Routes the job execution to the specific processor based on its type
     */
    process(jobId: string): Promise<void>;
}
