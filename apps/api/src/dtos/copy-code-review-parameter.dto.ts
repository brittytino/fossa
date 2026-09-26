import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CopyCodeReviewParameterDTO {
    @IsString()
    @ApiProperty()
    sourceRepositoryId: string;

    @IsString()
    @ApiProperty()
    targetRepositoryId: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    targetDirectoryPath: string;

    @IsString()
    @ApiProperty()
    teamId: string;
}
