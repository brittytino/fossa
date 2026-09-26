import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
    @ApiProperty({ type: Number, example: 400 })
    statusCode: number;

    @ApiProperty({
        example: '2026-02-05T12:00:00.000Z',
        description: 'ISO timestamp when the error occurred',
    })
    timestamp: string;

    @ApiProperty({ example: '/v1/resource' })
    path: string;

    @ApiProperty({ example: 'Bad Request' })
    error: string;

    @ApiProperty({ example: 'Validation failed' })
    message: string;

    @ApiPropertyOptional({ example: 'validation.failed' })
    error_key?: string;
}
