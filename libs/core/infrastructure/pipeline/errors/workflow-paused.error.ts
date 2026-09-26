/**
 * Error thrown when a workflow stage needs to pause and wait for an external event.
 * This allows the worker to free up and process other jobs while waiting.
 */
export class WorkflowPausedError extends Error {
    constructor(
        public readonly eventType: string,
        public readonly eventKey: string,
        public readonly timeout: number,
        public readonly context?: Record<string, unknown>,
        message?: string,
    ) {
        super(
            message ||
                `Workflow paused waiting for event: ${eventType} (key: ${eventKey})`,
        );
        this.name = 'WorkflowPausedError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, WorkflowPausedError);
        }
    }
}
