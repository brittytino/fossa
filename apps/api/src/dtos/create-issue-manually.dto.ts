import { Type } from 'class-transformer';
import {
    IsString,
    IsEnum,
    IsObject,
    IsOptional,
    ValidateNested,
    IsNumber,
} from 'class-validator';

import { IRepositoryToIssues } from '@libs/issues/domain/interfaces/fossyIssuesManagement.interface';
import { LabelType } from '@libs/common/utils/codeManagement/labels';
import { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GitUserDto {
    @IsNumber()
    @ApiProperty({ type: Number })
    gitId: number;

    @IsString()
    @ApiProperty()
    username: string;
}

class RepositoryToIssuesDto {
    @IsString()
    @ApiProperty()
    id: string;

    @IsString()
    @ApiProperty()
    name: string;

    @IsString()
    @ApiProperty()
    full_name: string;

    @IsString()
    @ApiProperty()
    platform: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    url?: string;
}

export class CreateIssueManuallyDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @ApiProperty()
    description: string;

    @IsString()
    @ApiProperty()
    filePath: string;

    @IsString()
    @ApiProperty()
    language: string;

    @IsEnum(LabelType)
    @ApiProperty({ enum: LabelType, enumName: 'LabelType' })
    label: LabelType;

    @IsEnum(SeverityLevel)
    @ApiProperty({ enum: SeverityLevel, enumName: 'SeverityLevel' })
    severity: SeverityLevel;

    @IsString()
    @ApiProperty()
    organizationId: string;

    @IsObject()
    @ApiProperty({ type: RepositoryToIssuesDto })
    repository: IRepositoryToIssues;

    @IsOptional()
    @ValidateNested()
    @Type(() => GitUserDto)
    @ApiPropertyOptional({ type: GitUserDto })
    owner: GitUserDto;

    @ValidateNested()
    @Type(() => GitUserDto)
    @ApiProperty({ type: GitUserDto })
    reporter: GitUserDto;
}
