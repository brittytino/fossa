import {
    FossyRuleSeverity,
    FossyRulesExampleDto,
} from './create-fossy-rule.dto';
import {
    FossyRulesOrigin,
    FossyRulesStatus,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsNotEmpty,
    IsEnum,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class DirectoryInfoDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'src/services' })
    directoryId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '1135722979' })
    repositoryId: string;
}

export class AddLibraryFossyRulesDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'Team identifier used to resolve team-scoped centralized configuration.',
        example: '2e4f7a61-3c8c-4af5-bf25-2d0cbb19c4d1',
    })
    teamId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        format: 'uuid',
        example: '1e6f6a92-5b4b-4b7d-9c31-4f55f4e9cbd1',
    })
    uuid?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Avoid null comparisons' })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example:
            'Avoid comparing to null; prefer strict checks or type guards.',
    })
    rule: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'src/services' })
    path: string;

    @IsNotEmpty()
    @IsEnum(FossyRuleSeverity)
    @ApiProperty({ enum: FossyRuleSeverity, enumName: 'FossyRuleSeverity' })
    severity: FossyRuleSeverity;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ type: String, isArray: true, example: ['1135722979'] })
    repositoriesIds: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DirectoryInfoDto)
    @IsOptional()
    @ApiPropertyOptional({ type: DirectoryInfoDto, isArray: true })
    directoriesInfo?: DirectoryInfoDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FossyRulesExampleDto)
    @ApiPropertyOptional({ type: FossyRulesExampleDto, isArray: true })
    examples: FossyRulesExampleDto[];

    @IsOptional()
    @IsEnum(FossyRulesStatus)
    @ApiPropertyOptional({ enum: FossyRulesStatus, enumName: 'FossyRulesStatus' })
    status?: FossyRulesStatus;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'file' })
    scope?: string;

    @IsOptional()
    @IsEnum(FossyRulesOrigin)
    @ApiPropertyOptional({ enum: FossyRulesOrigin, enumName: 'FossyRulesOrigin' })
    origin?: FossyRulesOrigin;
}
