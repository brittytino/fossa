// serialize.ts
import {
    JsonRpcCode,
    AccessDeniedError,
    BackendError,
    NotFoundError,
    RateLimitError,
    TimeoutError,
    ValidationError,
} from './errors';

type JsonRpcError = {
    jsonrpc: '2.0';
    id: string | number | null;
    error: { code: number; message: string; data?: any };
};

type ToolErrorPayload = {
    code: number;
    name: string;
    message: string;
    data?: any;
};

const MAX_CAUSE_DEPTH = 2;

function safeData(obj: any) {
    // evite vazar segredos: whiteliste algumas chaves comuns
    const out: any = {};
    if (!obj || typeof obj !== 'object') return undefined;
    for (const k of [
        'service',
        'resource',
        'httpStatus',
        'method',
        'url',
        'retryAfter',
        'retryable',
        'requestId',
    ]) {
        if (obj[k] !== undefined) out[k] = obj[k];
    }
    return Object.keys(out).length ? out : undefined;
}

function serializeCause(err: any, depth = 0): any {
    if (!err?.cause || depth >= MAX_CAUSE_DEPTH) return undefined;
    const c = err.cause;
    return {
        name: c.name || 'Error',
        message: String(c.message || c),
        data: safeData(c),
        cause: serializeCause(c, depth + 1),
    };
}

function mapCode(e: any): { code: number; message: string; data?: any } {
    // Axios?
    const isAxios = !!(e?.isAxiosError || e?.response?.status);
    if (isAxios) {
        const status = e.response?.status;
        const base = {
            message: e.message || (e.response?.statusText ?? 'HTTP error'),
            data: {
                httpStatus: status,
                method: e.config?.method,
                url: e.config?.url,
                service: e.service,
                retryAfter: Number(e.response?.headers?.['retry-after']),
                retryable: [502, 503, 504, 408].includes(status),
                requestId: e.response?.headers?.['x-request-id'],
            },
        };
        if (status === 404) return { code: JsonRpcCode.NOT_FOUND, ...base };
        if (status === 401 || status === 403)
            return {
                code: JsonRpcCode.ACCESS_DENIED,
                message: 'Access denied',
                data: base.data,
            };
        if (status === 429)
            return {
                code: JsonRpcCode.RATE_LIMIT,
                message: 'Rate limited',
                data: base.data,
            };
        if ([400, 422].includes(status))
            return {
                code: JsonRpcCode.VALIDATION_ERROR,
                message: 'Validation error',
                data: base.data,
            };
        if (status && status >= 500)
            return {
                code: JsonRpcCode.BACKEND_ERROR,
                message: 'Backend error',
                data: base.data,
            };
    }

    // Classes específicas
    if (e instanceof TimeoutError)
        return {
            code: JsonRpcCode.TIMEOUT,
            message: e.message,
            data: safeData(e.data),
        };
    if (e instanceof RateLimitError)
        return {
            code: JsonRpcCode.RATE_LIMIT,
            message: e.message,
            data: safeData(e.data),
        };
    if (e instanceof AccessDeniedError)
        return {
            code: JsonRpcCode.ACCESS_DENIED,
            message: e.message,
            data: safeData(e.data),
        };
    if (e instanceof NotFoundError)
        return {
            code: JsonRpcCode.NOT_FOUND,
            message: e.message,
            data: safeData(e.data),
        };
    if (e instanceof ValidationError)
        return {
            code: JsonRpcCode.VALIDATION_ERROR,
            message: e.message,
            data: safeData(e.data),
        };
    if (e instanceof BackendError)
        return {
            code: JsonRpcCode.BACKEND_ERROR,
            message: e.message,
            data: safeData(e.data),
        };

    // Fallback
    return {
        code: JsonRpcCode.INTERNAL_ERROR,
        message: e?.message || 'Internal error',
    };
}

// Modo 1: erro de PROTOCOLO (JSON-RPC)
export function toJsonRpcError(
    e: any,
    id: string | number | null,
): JsonRpcError {
    const { code, message, data } = mapCode(e);
    const env = process.env.NODE_ENV;
    const withStack =
        env !== 'production' && e?.stack
            ? { stack: String(e.stack) }
            : undefined;
    return {
        jsonrpc: '2.0',
        id,
        error: {
            code,
            message,
            data: {
                ...data,
                name: e?.name,
                cause: serializeCause(e),
                ...withStack,
            },
        },
    };
}

// Modo 2: erro de TOOL (para ToolResult.isError)
export function toToolErrorPayload(e: any): ToolErrorPayload {
    const { code, message, data } = mapCode(e);
    const env = process.env.NODE_ENV;
    const withStack =
        env !== 'production' && e?.stack
            ? { stack: String(e.stack) }
            : undefined;
    return {
        code,
        name: e?.name || 'Error',
        message,
        data: { ...data, cause: serializeCause(e), ...withStack },
    };
}
