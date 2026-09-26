import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteRouterDto {
    @IsObject()
    @ApiProperty({
        type: Object,
        description: 'Router payload (schema varies by agent workflow).',
        additionalProperties: true,
    })
    router: any;

    @IsString()
    @ApiProperty()
    message: string;

    @IsString()
    @ApiProperty()
    userId: string;

    @IsString()
    @ApiProperty()
    channel: string;

    @IsString()
    @ApiProperty()
    sessionId: string;

    @IsString()
    @ApiProperty()
    userName: string;

    @IsUUID()
    @IsOptional()
    @ApiPropertyOptional()
    teamId?: string;

    @IsUUID()
    @IsOptional()
    @ApiPropertyOptional()
    organizationId?: string;
}
