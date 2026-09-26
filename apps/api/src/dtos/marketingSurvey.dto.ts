import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarketingSurveyDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'search' })
    referralSource?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'speed' })
    primaryGoal?: string;
}
