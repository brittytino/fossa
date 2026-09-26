import { applyDecorators } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../dtos/api-error.dto';

export type ApiStandardResponsesOptions = {
    includeAuth?: boolean;
};

export const ApiStandardResponses = (
    options: ApiStandardResponsesOptions = {},
) => {
    const { includeAuth = true } = options;

    const decorators = [
        ApiBadRequestResponse({
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: { $ref: getSchemaPath(ApiErrorDto) },
                    examples: {
                        validationError: {
                            value: {
                                statusCode: 400,
                                timestamp: '2026-02-05T12:00:00.000Z',
                                path: '/v1/resource',
                                error: 'Bad Request',
                                message: 'Validation failed',
                                error_key: 'validation.failed',
                            },
                        },
                    },
                },
            },
        }),
        ApiInternalServerErrorResponse({
            description: 'Unexpected error',
            content: {
                'application/json': {
                    schema: { $ref: getSchemaPath(ApiErrorDto) },
                    examples: {
                        internalError: {
                            value: {
                                statusCode: 500,
                                timestamp: '2026-02-05T12:00:00.000Z',
                                path: '/v1/resource',
                                error: 'Internal Server Error',
                                message: 'Unexpected error',
                                error_key: 'internal.error',
                            },
                        },
                    },
                },
            },
        }),
    ];

    if (includeAuth) {
        decorators.push(
            ApiUnauthorizedResponse({
                description: 'Not authenticated',
                content: {
                    'application/json': {
                        schema: { $ref: getSchemaPath(ApiErrorDto) },
                        examples: {
                            notAuthenticated: {
                                value: {
                                    statusCode: 401,
                                    timestamp: '2026-02-05T12:00:00.000Z',
                                    path: '/v1/resource',
                                    error: 'Unauthorized',
                                    message: 'Not authenticated',
                                    error_key: 'auth.unauthorized',
                                },
                            },
                        },
                    },
                },
            }),
            ApiForbiddenResponse({
                description: 'Insufficient permissions',
                content: {
                    'application/json': {
                        schema: { $ref: getSchemaPath(ApiErrorDto) },
                        examples: {
                            forbidden: {
                                value: {
                                    statusCode: 403,
                                    timestamp: '2026-02-05T12:00:00.000Z',
                                    path: '/v1/resource',
                                    error: 'Forbidden',
                                    message: 'Insufficient permissions',
                                    error_key: 'auth.forbidden',
                                },
                            },
                        },
                    },
                },
            }),
        );
    }

    return applyDecorators(...decorators);
};
