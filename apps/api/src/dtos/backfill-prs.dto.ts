import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BackfillPRsDto {
    @IsString()
    @ApiProperty({ example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0' })
    public teamId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({
        type: String,
        isArray: true,
        example: ['1135722979', '1135722980'],
    })
    public repositoryIds?: string[];

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        format: 'date-time',
        example: '2025-01-01T00:00:00.000Z',
    })
    public startDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        format: 'date-time',
        example: '2025-02-01T00:00:00.000Z',
    })
    public endDate?: string;
}
