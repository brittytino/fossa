export class WorkflowPausedError extends Error {
    constructor(
        public readonly eventType: string,
        public readonly eventKey: string,
        public readonly stageName: string,
        public readonly taskId: string,
        public readonly timeout: number,
        public readonly metadata: Record<string, any> = {},
    ) {
        super(
            `Workflow paused at stage ${stageName} waiting for event ${eventType}`,
        );
        this.name = 'WorkflowPausedError';
    }
}
