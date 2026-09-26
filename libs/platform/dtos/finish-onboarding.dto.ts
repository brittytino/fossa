import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinishOnboardingDTO {
    @IsString()
    @ApiProperty({ example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0' })
    teamId: string;

    @IsBoolean()
    @ApiProperty({ type: Boolean, example: true })
    reviewPR: boolean;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '1135722979' })
    repositoryId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'fossa-ai' })
    repositoryName?: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ type: Number, example: 128 })
    pullNumber?: number;
}
