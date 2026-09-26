import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateFossyRulesDTO {
    @IsString()
    @ApiProperty({ example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0' })
    teamId: string;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number, example: 1 })
    months?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number, example: 2 })
    weeks?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ type: Number, example: 14 })
    days?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        isArray: true,
        example: ['1135722979', '1135722980'],
    })
    repositoriesIds?: string[];
}
