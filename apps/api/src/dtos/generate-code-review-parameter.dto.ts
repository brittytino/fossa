import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { AlignmentLevel } from '@libs/code-review/domain/types/commentAnalysis.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateCodeReviewParameterDTO {
    @IsString()
    @ApiProperty()
    teamId: string;

    @IsEnum(AlignmentLevel)
    @IsOptional()
    @ApiPropertyOptional({ enum: AlignmentLevel, enumName: 'AlignmentLevel' })
    alignmentLevel?: AlignmentLevel;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number })
    months?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number })
    weeks?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number })
    days?: number;
}
