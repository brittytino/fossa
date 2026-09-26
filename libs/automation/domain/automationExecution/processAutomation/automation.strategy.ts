export const AUTOMATION_STRATEGY_TOKEN = Symbol.for('AutomationStrategy');

export interface IAutomationStrategy {
    route(
        message: string,
        userId: string,
        channel: string,
        sessionId?: string,
        userName?: string,
    ): Promise<any>;
}
