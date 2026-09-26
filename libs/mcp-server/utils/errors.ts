// errors.ts
export enum JsonRpcCode {
    PARSE_ERROR = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603,
    // Server errors: -32000 to -32099
    SERVER_ERROR = -32000,

    // Seus subtipos (no range do servidor)
    TIMEOUT = -32001,
    RATE_LIMIT = -32002,
    BACKEND_ERROR = -32003,
    ACCESS_DENIED = -32004,
    NOT_FOUND = -32005,
    VALIDATION_ERROR = -32006,
}

export class NotFoundError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'NotFoundError';
    }
}
export class AccessDeniedError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'AccessDeniedError';
    }
}
export class BackendError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'BackendError';
    }
}
export class TimeoutError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'TimeoutError';
    }
}
export class RateLimitError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'RateLimitError';
    }
}
export class ValidationError extends Error {
    constructor(
        msg: string,
        public data?: any,
    ) {
        super(msg);
        this.name = 'ValidationError';
    }
}
