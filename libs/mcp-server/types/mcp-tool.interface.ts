import { z } from 'zod';

type ZodShape = z.ZodRawShape;
type ZodObjectLike<S extends ZodShape = ZodShape> = z.ZodObject<S> | S;

export type McpToolAnnotations = {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
    [k: string]: unknown;
};

export interface McpToolDefinition<
    I extends ZodShape = ZodShape,
    O extends ZodShape = ZodShape,
> {
    name: string;
    description: string;
    inputSchema: ZodObjectLike<I>;
    outputSchema?: ZodObjectLike<O>;
    annotations?: McpToolAnnotations;

    execute: (
        args: z.infer<z.ZodObject<I>>,
        extra?: any,
    ) => Promise<z.infer<z.ZodObject<O>>>;
}

export interface McpToolDefinitionTemplate<I extends ZodShape = ZodShape> {
    name: string;
    description: string;
    inputSchema: ZodObjectLike<I>;
}

export interface McpToolResult {
    content: Array<{ type: 'text'; text: string }>;
    _meta?: Record<string, unknown>;
}

export interface McpToolRegistry {
    getTools(): McpToolDefinition[];
    registerTool(tool: McpToolDefinition): void;
}

export const toShape = (x?: z.ZodObject<any> | z.ZodRawShape) => {
    if (!x) {
        return undefined;
    }

    return x instanceof z.ZodObject ? (x as z.ZodObject<any>).shape : x;
};

export interface BaseResponse {
    success: boolean;
    count?: number;
}
