export interface StageCompletedEvent {
    stageName: string;
    eventType: string;
    eventKey: string;
    taskId: string;
    result?: any;
    workflowJobId?: string;
    correlationId?: string;
}
