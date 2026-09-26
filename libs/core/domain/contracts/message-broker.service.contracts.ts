export type MessagePayload<T = any> = {
    event_version: number;
    occurred_on: Date;
    payload: T;
    event_name: string;
    messageId: string;
};

export type BrokerConfig = {
    exchange: string;
    routingKey: string;
};

export type BrokerPublishOptions = {
    correlationId?: string;
    headers?: Record<string, any>;
    persistent?: boolean;
    /**
     * amqp-connection-manager option: reject publish promise if not confirmed within this timeout (ms).
     */
    timeout?: number;
    /**
     * If true, broker returns unroutable messages to publisher (basic.return).
     */
    mandatory?: boolean;
    expiration?: string | number;
    userId?: string;
    CC?: string | string[];
    BCC?: string | string[];
    replyTo?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    appId?: string;
};

export const MESSAGE_BROKER_SERVICE_TOKEN = Symbol.for('MessageBrokerService');

export interface IMessageBrokerService {
    isConnected(): boolean;

    publishMessage(
        config: BrokerConfig,
        message: MessagePayload,
        options?: BrokerPublishOptions,
    ): Promise<void>;

    transformMessageToMessageBroker<T = any>({
        eventName,
        message,
        event_version,
        occurred_on,
        messageId,
    }: {
        eventName: string;
        message: T;
        event_version?: number;
        occurred_on?: Date;
        messageId?: string;
    }): MessagePayload<T>;
}
