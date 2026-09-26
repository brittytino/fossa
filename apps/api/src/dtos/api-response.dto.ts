import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseBaseDto {
    @ApiProperty({ type: Number, example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Object' })
    type: string;
}

export class ApiArrayResponseDto extends ApiResponseBaseDto {
    @ApiProperty({
        type: Object,
        isArray: true,
        description:
            'Array of objects with endpoint-specific schema (see endpoint documentation).',
    })
    data: Record<string, unknown>[];
}

export class ApiObjectResponseDto extends ApiResponseBaseDto {
    @ApiProperty({
        type: Object,
        description:
            'Object with endpoint-specific schema (see endpoint documentation).',
        additionalProperties: true,
    })
    data: Record<string, unknown>;
}

export class ApiBooleanResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: Boolean })
    data: boolean;
}

export class ApiStringResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: String })
    data: string;
}

export class ApiStringArrayResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: String, isArray: true })
    data: string[];
}

export class ApiYamlStringResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: String })
    data: string;
}
