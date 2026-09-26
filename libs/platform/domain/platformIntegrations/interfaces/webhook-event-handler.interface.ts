import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';

/**
 * Interface for the parameters passed to webhook event handlers.
 */
export interface IWebhookEventParams {
    payload: any;
    event: string;
    platformType: PlatformType;
    correlationId?: string;
}

/**
 * Interface for webhook event handlers.
 * Each handler is responsible for determining if it can process an event
 * and then executing the necessary logic.
 */
export interface IWebhookEventHandler {
    /**
     * Checks if this handler can process the given event.
     * @param params The webhook event parameters.
     * @returns True if the handler can process the event, false otherwise.
     */
    canHandle(params: IWebhookEventParams): boolean;

    /**
     * Executes the logic for processing the webhook event.
     * @param params The webhook event parameters.
     */
    execute(params: IWebhookEventParams): Promise<void>;
}
